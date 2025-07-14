import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { shipmentService } from '@/lib/services/shipments'
import { z } from 'zod'

const shipmentUpdateSchema = z.object({
  shipment_date: z.string().optional(),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled']).optional(),
  notes: z.string().optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const shipment = await shipmentService.getShipmentById(id)
    
    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Sevkiyat bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: shipment })
  } catch (error) {
    console.error('Sevkiyat detay hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const parse = shipmentUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await shipmentService.updateShipment(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Sevkiyat güncelleme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = await params
    await shipmentService.deleteShipment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sevkiyat silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 