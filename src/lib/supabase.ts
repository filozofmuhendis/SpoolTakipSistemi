// Mock Supabase Client for client-side environment
// Simulates Supabase Client APIs and redirects all operations to local localStorage database

import { mockDbManager } from './mockDatabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

class MockSupabaseQueryBuilder {
  private tableName: string
  private filters: Array<(item: any) => boolean> = []
  private orderCol: string | null = null
  private orderAsc: boolean = true
  private limitVal: number | null = null
  private isSingle: boolean = false
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private payload: any = null
  private countOptions: { count?: string; head?: boolean } | null = null

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(_fields?: string, options?: { count?: string; head?: boolean }) {
    if (options) {
      this.countOptions = options
    }
    return this
  }

  eq(col: string, val: any) {
    this.filters.push(item => item[col] === val)
    return this
  }

  or(expr: string) {
    this.filters.push(item => {
      const parts = expr.split(',')
      return parts.some(part => {
        const ilikeParts = part.split('.ilike.')
        if (ilikeParts.length === 2) {
          const c = ilikeParts[0]!.trim()
          const v = ilikeParts[1]!.replace(/%/g, '').trim().toLowerCase()
          return item[c]?.toString().toLowerCase().includes(v)
        }
        const eqParts = part.split('.eq.')
        if (eqParts.length === 2) {
          const c = eqParts[0]!.trim()
          const v = eqParts[1]!.trim()
          return item[c]?.toString() === v
        }
        return false
      })
    })
    return this
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col
    this.orderAsc = options?.ascending !== false
    return this
  }

  limit(n: number) {
    this.limitVal = n
    return this
  }

  gte(col: string, val: any) {
    this.filters.push(item => {
      if (!item[col]) return false
      return new Date(item[col]) >= new Date(val)
    })
    return this
  }

  lte(col: string, val: any) {
    this.filters.push(item => {
      if (!item[col]) return false
      return new Date(item[col]) <= new Date(val)
    })
    return this
  }

  lt(col: string, val: any) {
    this.filters.push(item => {
      if (item[col] === undefined || item[col] === null) return false
      return item[col] < val
    })
    return this
  }

  in(col: string, val: any[]) {
    this.filters.push(item => {
      return val.includes(item[col])
    })
    return this
  }

  not(col: string, op: string, val: any) {
    if (op === 'is' && val === null) {
      this.filters.push(item => item[col] !== null && item[col] !== undefined)
    } else {
      this.filters.push(item => item[col] !== val)
    }
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  insert(record: any) {
    this.action = 'insert'
    this.payload = record
    return this
  }

  update(updates: any) {
    this.action = 'update'
    this.payload = updates
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  upsert(record: any) {
    this.action = 'upsert'
    this.payload = record
    return this
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute()
      return onfulfilled ? onfulfilled(result) : result
    } catch (err) {
      if (onrejected) return onrejected(err)
      throw err
    }
  }

  private async execute() {
    try {
      if (this.action === 'insert') {
        let result: any
        if (Array.isArray(this.payload)) {
          result = this.payload.map(r => mockDbManager.insertRecord(this.tableName as any, r))
        } else {
          result = mockDbManager.insertRecord(this.tableName as any, this.payload)
        }
        if (this.isSingle) {
          return { data: Array.isArray(result) ? result[0] : result, error: null }
        }
        return { data: result, error: null }
      }

      if (this.action === 'upsert') {
        const data = mockDbManager.getTable(this.tableName as any)
        const recordArray = Array.isArray(this.payload) ? this.payload : [this.payload]
        const upsertedList = recordArray.map(r => {
          if (r.id && data.some(item => item.id === r.id)) {
            return mockDbManager.updateRecord(this.tableName as any, r.id, r)
          } else {
            return mockDbManager.insertRecord(this.tableName as any, r)
          }
        })
        const result = Array.isArray(this.payload) ? upsertedList : upsertedList[0]
        if (this.isSingle) {
          return { data: Array.isArray(result) ? result[0] : result, error: null }
        }
        return { data: result, error: null }
      }

      if (this.action === 'update') {
        const data = mockDbManager.getTable(this.tableName as any)
        let filtered = data
        for (const filter of this.filters) {
          filtered = filtered.filter(filter)
        }
        const updatedList = filtered.map(item => mockDbManager.updateRecord(this.tableName as any, item.id, this.payload))
        if (this.isSingle) {
          return { data: updatedList[0] || null, error: updatedList.length === 0 ? { message: 'Not found' } : null }
        }
        return { data: updatedList, error: null }
      }

      if (this.action === 'delete') {
        const data = mockDbManager.getTable(this.tableName as any)
        let filtered = data
        for (const filter of this.filters) {
          filtered = filtered.filter(filter)
        }
        filtered.forEach(item => mockDbManager.deleteRecord(this.tableName as any, item.id))
        return { data: null, error: null }
      }

      // Default action: select
      let data = mockDbManager.getTable(this.tableName as any)

      // Relation resolution helper
      if (this.tableName === 'inventory') {
        data = data.map(item => {
          const newItem = { ...item }
          if (newItem.project_id) {
            const proj = mockDbManager.getTable('projects').find(p => p.id === newItem.project_id)
            newItem.projects = proj ? { name: proj.name } : null
          }
          return newItem
        })
      }

      // Apply filters
      for (const filter of this.filters) {
        data = data.filter(filter)
      }

      // Apply ordering
      if (this.orderCol) {
        data = [...data].sort((a, b) => {
          const valA = a[this.orderCol!]
          const valB = b[this.orderCol!]
          if (valA === valB) return 0
          if (valA === null || valA === undefined) return 1
          if (valB === null || valB === undefined) return -1
          
          const compare = valA < valB ? -1 : 1
          return this.orderAsc ? compare : -compare
        })
      }

      // Apply limit
      if (this.limitVal !== null) {
        data = data.slice(0, this.limitVal)
      }

      let count: number | null = null
      if (this.countOptions && this.countOptions.count) {
        count = data.length
      }

      if (this.countOptions?.head) {
        return { data: null, count, error: null }
      }

      if (this.isSingle) {
        if (data.length === 0) {
          return { data: null, count, error: { message: 'Not found' } }
        }
        return { data: data[0], count, error: null }
      }

      return { data, count, error: null }
    } catch (err: any) {
      return { data: null, count: null, error: err }
    }
  }
}

// Storage Mock Client
const mockStorage = {
  from(_bucket: string) {
    return {
      async upload(path: string, _file: any) {
        return {
          data: { path },
          error: null
        }
      }
    }
  }
}

// Auth Mock Client
const mockAuth = {
  async updateUser(_updates: any) {
    return { data: { user: {} }, error: null }
  }
}

// Create and export compatible mocked supabase clients, typed strictly
export const supabase = {
  from(table: string) {
    let mappedTable = table
    if (table === 'productions') mappedTable = 'productions'
    return new MockSupabaseQueryBuilder(mappedTable)
  },
  storage: mockStorage,
  auth: mockAuth
} as unknown as SupabaseClient<Database>

export const supabaseAdmin = supabase