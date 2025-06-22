import { supabase } from '@/lib/supabase'

export function useData() {
  const getProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  const getSpools = async (projectId?: string) => {
    let query = supabase
      .from('spools')
      .select('*, project:projects(*)')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  const getMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  const getPersonnel = async () => {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  // Project Operations
  const createProject = async (data: { name: string; description?: string }) => {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return project
  }

  const updateProject = async (id: string, data: { name?: string; description?: string; status?: string }) => {
    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return project
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Spool Operations
  const createSpool = async (data: { project_id: string; code: string; description?: string }) => {
    const { data: spool, error } = await supabase
      .from('spools')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return spool
  }

  const updateSpool = async (id: string, data: { code?: string; description?: string; status?: string }) => {
    const { data: spool, error } = await supabase
      .from('spools')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return spool
  }

  const deleteSpool = async (id: string) => {
    const { error } = await supabase
      .from('spools')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Material Operations
  const createMaterial = async (data: { name: string; type?: string; unit?: string; stock_quantity?: number }) => {
    const { data: material, error } = await supabase
      .from('materials')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return material
  }

  const updateMaterial = async (id: string, data: { name?: string; type?: string; unit?: string; stock_quantity?: number }) => {
    const { data: material, error } = await supabase
      .from('materials')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return material
  }

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Personnel Operations
  const createPersonnel = async (data: { user_id: string; name: string; position?: string }) => {
    const { data: personnel, error } = await supabase
      .from('personnel')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return personnel
  }

  const updatePersonnel = async (id: string, data: { name?: string; position?: string; status?: string }) => {
    const { data: personnel, error } = await supabase
      .from('personnel')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return personnel
  }

  const deletePersonnel = async (id: string) => {
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    getProjects,
    getSpools,
    getMaterials,
    getPersonnel,
    createProject,
    updateProject,
    deleteProject,
    createSpool,
    updateSpool,
    deleteSpool,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    createPersonnel,
    updatePersonnel,
    deletePersonnel
  }
}