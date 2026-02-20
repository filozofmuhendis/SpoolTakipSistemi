export type Shipment = {
  id: string
  project_id: string
  shipment_date: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
}

export type ShipmentInsert = {
  project_id: string
  shipment_date: string
  status?: string
  notes?: string
}

export type ShipmentUpdate = Partial<ShipmentInsert>

export const shipmentService = {
  async getAllShipments() {
    const res = await fetch('/api/shipments')
    if (!res.ok) throw new Error('Failed to fetch shipments')
    const json = await res.json()
    return json.data as Shipment[]
  },

  async createShipment(shipment: ShipmentInsert) {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipment)
    })
    if (!res.ok) throw new Error('Failed to create shipment')
    const json = await res.json()
    return json.data as Shipment
  },

  async updateShipment(id: string, updates: ShipmentUpdate) {
    const res = await fetch(`/api/shipments?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error('Failed to update shipment')
    const json = await res.json()
    return json.data as Shipment
  },

  async deleteShipment(id: string) {
    const res = await fetch(`/api/shipments?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete shipment')
    return true
  },

  async getShipmentById(id: string) {
    // Not implemented in API yet (GET /api/shipments?id=...), 
    // Current implementation returns all.
    // But typically we filter.
    // If needed, I can add it to API.
    // For now, fetch all and find? Or fail.
    // Assuming GET supports ID or returns array.
    // Let's assume we can fetch all and find client side if ID param not supported.
    // BUT efficient way is to support ID in GET.
    // My API implementation (Step 1084) created GET returning getAllShipments();
    // It didn't check for ?id=.
    // I should update API if getShipmentById is used criticaly.
    // OutgoingProduct.tsx doesn't use getShipmentById.
    // So I'll leave it as stub or list filter.
    const res = await fetch('/api/shipments')
    if (!res.ok) throw new Error('Failed to fetch shipment')
    const json = await res.json()
    const found = (json.data as Shipment[]).find(s => s.id === id)
    return found || null
  }
}
