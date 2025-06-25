import { supabase } from '../supabase'
import { Personnel } from '@/types'

export const personnelService = {
  // Tüm personeli getir
  async getAllPersonnel() {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Personel listesi getirilemedi:', error)
        return []
      }

      // Veri yoksa boş array döndür
      if (!data || data.length === 0) {
        return []
      }

      return data.map(person => ({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone,
        position: person.position,
        department: person.department,
        status: person.status,
        hireDate: person.hire_date,
        createdAt: person.created_at,
        updatedAt: person.updated_at
      }))
    } catch (error) {
      console.log('Personel listesi getirilemedi:', error)
      return []
    }
  },

  // Personel oluştur
  async createPersonnel(personnel: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('personnel')
      .insert({
        name: personnel.name,
        email: personnel.email,
        phone: personnel.phone,
        position: personnel.position,
        department: personnel.department,
        status: personnel.status,
        hire_date: personnel.hireDate
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Personel oluşturulamadı: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      status: data.status,
      hireDate: data.hire_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Personel güncelle
  async updatePersonnel(id: string, updates: Partial<Personnel>) {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.email) updateData.email = updates.email
    if (updates.phone) updateData.phone = updates.phone
    if (updates.position) updateData.position = updates.position
    if (updates.department) updateData.department = updates.department
    if (updates.status) updateData.status = updates.status
    if (updates.hireDate) updateData.hire_date = updates.hireDate
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('personnel')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Personel güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      status: data.status,
      hireDate: data.hire_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Personel sil
  async deletePersonnel(id: string) {
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Personel silinemedi: ${error.message}`)
    }

    return true
  },

  // Personel detayını getir
  async getPersonnelById(id: string) {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.log('Personel bulunamadı:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        status: data.status,
        hireDate: data.hire_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.log('Personel bulunamadı:', error)
      return null
    }
  },

  // Departman bazlı personel getir
  async getPersonnelByDepartment(department: string) {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('department', department)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Departman personeli getirilemedi: ${error.message}`)
    }

    return data.map(person => ({
      id: person.id,
      name: person.name,
      email: person.email,
      phone: person.phone,
      position: person.position,
      department: person.department,
      status: person.status,
      hireDate: person.hire_date,
      createdAt: person.created_at,
      updatedAt: person.updated_at
    }))
  }
}

export async function getAllPersonnelBasic(): Promise<Pick<Personnel, 'id' | 'name'>[]> {
  try {
    const { data, error } = await supabase
      .from('personnel')
      .select('id, name')
    
    if (error) {
      console.log('Personel listesi getirilemedi:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.log('Personel listesi getirilemedi:', error)
    return []
  }
} 
