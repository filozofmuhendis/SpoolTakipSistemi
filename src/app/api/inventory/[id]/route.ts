import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { inventoryService } from '@/lib/services/inventory'
import { z } from 'zod'

const inventoryUpdateSchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir').optional(),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır').optional(),
  location: z.string().min(1, 'Konum gereklidir').optional(),
  notes: z.string().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = params
    const inventory = await inventoryService.getInventoryById(id)
    
    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'Envanter öğesi bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Envanter detay hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = params
    const body = await req.json()
    const parse = inventoryUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await inventoryService.updateInventory(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Envanter güncelleme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = params
    await inventoryService.deleteInventory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Envanter silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 