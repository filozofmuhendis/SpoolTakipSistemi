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

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(_fields?: string) {
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

  single() {
    this.isSingle = true
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
      let data = mockDbManager.getTable(this.tableName as any)
      
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

      if (this.isSingle) {
        if (data.length === 0) {
          return { data: null, error: { message: 'Not found' } }
        }
        return { data: data[0], error: null }
      }

      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err }
    }
  }

  insert(record: any) {
    try {
      let result: any
      if (Array.isArray(record)) {
        result = record.map(r => mockDbManager.insertRecord(this.tableName as any, r))
      } else {
        result = mockDbManager.insertRecord(this.tableName as any, record)
      }
      
      const response = { data: result, error: null }
      return {
        ...response,
        select: () => ({
          single: () => Promise.resolve({ data: Array.isArray(result) ? result[0] : result, error: null }),
          then: (onfulfilled: any) => onfulfilled({ data: result, error: null })
        }),
        then: (onfulfilled: any) => onfulfilled(response)
      }
    } catch (err: any) {
      return {
        data: null,
        error: err,
        then: (onfulfilled: any) => onfulfilled({ data: null, error: err })
      }
    }
  }

  update(updates: any) {
    const self = this
    return {
      eq(col: string, val: any) {
        self.eq(col, val)
        const runUpdate = () => {
          const data = mockDbManager.getTable(self.tableName as any)
          let filtered = data
          for (const filter of self.filters) {
            filtered = filtered.filter(filter)
          }
          const updatedList = filtered.map(item => mockDbManager.updateRecord(self.tableName as any, item.id, updates))
          return updatedList
        }

        return {
          select() {
            return {
              single() {
                const list = runUpdate()
                if (list.length === 0) {
                  return Promise.resolve({ data: null, error: { message: 'Not found' } })
                }
                return Promise.resolve({ data: list[0], error: null })
              },
              then(onfulfilled: any) {
                const list = runUpdate()
                return onfulfilled({ data: list, error: null })
              }
            }
          },
          then(onfulfilled: any) {
            const list = runUpdate()
            return onfulfilled({ data: list, error: null })
          }
        }
      }
    }
  }

  upsert(record: any) {
    try {
      const data = mockDbManager.getTable(this.tableName as any)
      const recordArray = Array.isArray(record) ? record : [record]
      const upsertedList = recordArray.map(r => {
        if (r.id && data.some(item => item.id === r.id)) {
          return mockDbManager.updateRecord(this.tableName as any, r.id, r)
        } else {
          return mockDbManager.insertRecord(this.tableName as any, r)
        }
      })
      const result = Array.isArray(record) ? upsertedList : upsertedList[0]

      const response = { data: result, error: null }
      return {
        ...response,
        select: () => ({
          single: () => Promise.resolve({ data: Array.isArray(result) ? result[0] : result, error: null }),
          then: (onfulfilled: any) => onfulfilled({ data: result, error: null })
        }),
        then: (onfulfilled: any) => onfulfilled(response)
      }
    } catch (err: any) {
      return {
        data: null,
        error: err,
        then: (onfulfilled: any) => onfulfilled({ data: null, error: err })
      }
    }
  }

  delete() {
    const self = this
    return {
      eq(col: string, val: any) {
        self.eq(col, val)
        const data = mockDbManager.getTable(self.tableName as any)
        let filtered = data
        for (const filter of self.filters) {
          filtered = filtered.filter(filter)
        }
        filtered.forEach(item => mockDbManager.deleteRecord(self.tableName as any, item.id))
        return Promise.resolve({ data: null, error: null })
      }
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