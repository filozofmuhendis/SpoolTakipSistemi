export function useData() {
  const getProjects = async () => {
    const res = await fetch('/api/projects')
    if (!res.ok) throw new Error('Failed to fetch projects')
    const json = await res.json()
    return json.data
  }

  const getSpools = async (projectId?: string) => {
    const url = projectId ? `/api/spools?projectId=${projectId}` : '/api/spools'
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch spools')
    const json = await res.json()
    return json.data
  }

  const getMaterials = async () => {
    // Assuming /api/materials exists. If not, I'll create it.
    const res = await fetch('/api/materials')
    if (!res.ok) throw new Error('Failed to fetch materials')
    const json = await res.json()
    return json.data
  }

  const getPersonnel = async () => {
    const res = await fetch('/api/personnel')
    if (!res.ok) throw new Error('Failed to fetch personnel')
    const json = await res.json()
    return json.data
  }

  // Project Operations
  const createProject = async (data: { name: string; description?: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create project')
    const json = await res.json()
    return json.data
  }

  const updateProject = async (id: string, data: { name?: string; description?: string; status?: string }) => {
    const res = await fetch(`/api/projects?id=${id}`, { // OR /api/projects/[id] if dynamic route
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update project')
    const json = await res.json()
    return json.data
  }

  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete project')
  }

  // Spool Operations
  const createSpool = async (data: { project_id: string; code: string; description?: string }) => {
    // Mapping: hook expects 'code', 'description'.
    // API expects 'name' (for code?), 'status', 'project_id'. 
    // Spool model has 'name', 'status'.
    // Old code used 'code' -> 'spools' table.
    // My Prisma model has 'name' and 'status'.
    // I should map code -> name?
    // And add default status.
    const payload = {
      name: data.code, // Map code to name or vice versa? 
      // Previous schema had 'code' unique? 
      // My Prisma schema has 'name'. 
      // Let's assume name is the code.
      project_id: data.project_id
    }
    const res = await fetch('/api/spools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Failed to create spool')
    const json = await res.json()
    return json.data
  }

  const updateSpool = async (id: string, data: { code?: string; description?: string; status?: string }) => {
    const payload: any = {}
    if (data.code) payload.name = data.code
    if (data.status) payload.status = data.status

    const res = await fetch(`/api/spools?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Failed to update spool')
    const json = await res.json()
    return json.data
  }

  const deleteSpool = async (id: string) => {
    const res = await fetch(`/api/spools?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete spool')
  }

  // Material Operations
  const createMaterial = async (data: { name: string; type?: string; unit?: string; stock_quantity?: number }) => {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create material')
    const json = await res.json()
    return json.data
  }

  const updateMaterial = async (id: string, data: { name?: string; type?: string; unit?: string; stock_quantity?: number }) => {
    const res = await fetch(`/api/materials?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update material')
    const json = await res.json()
    return json.data
  }

  const deleteMaterial = async (id: string) => {
    const res = await fetch(`/api/materials?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete material')
  }

  // Personnel Operations
  const createPersonnel = async (data: { id: string; full_name: string; position?: string }) => {
    // createPersonnel in hook passed 'id' manually? 
    // NextAuth / Register handles creation.
    // This might be "Admin creating personnel"?
    // If so, use /api/personnel (POST).
    const res = await fetch('/api/personnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create personnel')
    const json = await res.json()
    return json.data
  }

  const updatePersonnel = async (id: string, data: { full_name?: string; position?: string; status?: string }) => {
    const res = await fetch(`/api/personnel?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update personnel')
    const json = await res.json()
    return json.data
  }

  const deletePersonnel = async (id: string) => {
    const res = await fetch(`/api/personnel?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete personnel')
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
