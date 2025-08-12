import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { inventoryService } from '@/lib/services/inventory'
import { Inventory } from '@/types'
import { z } from 'zod'

const inventorySchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir'),
  code: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['raw_material', 'finished_product', 'semi_finished', 'consumable']).optional(),
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır'),
  unit: z.string().optional(),
  min_stock: z.number().min(0).optional(),
  max_stock: z.number().min(0).optional(),
  location: z.string().min(1, 'Konum gereklidir'),
  supplier: z.string().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  cost: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  reorder_point: z.number().min(0).optional(),
  lead_time_days: z.number().min(0).optional(),
  notes: z.string().optional(),
  created_by: z.string().optional()
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
    console.log('Envanter listesi hatası:', error);
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

    // Filter out undefined values and prepare inventory data
    const inventoryData = Object.fromEntries(
      Object.entries(parse.data).filter(([_, value]) => value !== undefined)
    )
    
    const inventory = await inventoryService.createInventory(inventoryData as Omit<Inventory, 'id'>)
    return NextResponse.json({ success: true, data: inventory }, { status: 201 })
  } catch (error) {
    console.log('Envanter oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}