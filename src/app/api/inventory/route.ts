import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { inventoryService } from '@/lib/services/inventory'
import { z } from 'zod'

const inventorySchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir'),
  code: z.string().min(1, 'Malzeme kodu gereklidir'),
  category: z.string().min(1, 'Kategori gereklidir'),
  type: z.enum(['raw_material', 'finished_product', 'semi_finished', 'consumable']),
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır'),
  unit: z.string().min(1, 'Birim gereklidir'),
  minStock: z.number().min(0, 'Minimum stok 0 veya daha fazla olmalıdır'),
  maxStock: z.number().min(0, 'Maksimum stok 0 veya daha fazla olmalıdır'),
  location: z.string().min(1, 'Konum gereklidir'),
  supplier: z.string().min(1, 'Tedarikçi gereklidir'),
  projectId: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  cost: z.number().min(0, 'Maliyet 0 veya daha fazla olmalıdır'),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active')
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock')

    let inventory

    if (lowStock === 'true') {
      inventory = await inventoryService.getLowStockItems()
    } else if (category) {
      inventory = await inventoryService.getInventoryByCategory(category)
    } else if (search) {
      inventory = await inventoryService.searchInventory(search)
    } else {
      inventory = await inventoryService.getAllInventory()
    }

    return NextResponse.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Envanter listesi hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parse = inventorySchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const inventory = await inventoryService.createInventory(parse.data)
    return NextResponse.json({ success: true, data: inventory }, { status: 201 })
  } catch (error) {
    console.error('Envanter oluşturma hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 