import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { inventoryService } from '@/services/inventoryService'
import { z } from 'zod'

const inventorySchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir'),
  code: z.string().optional(), // Will be generated if missing
  category: z.string().min(1, 'Kategori gereklidir'),
  type: z.string().min(1, 'Tip gereklidir'), // Changed from enum to string as per schema.prisma
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır'),
  unit: z.string().min(1, 'Birim gereklidir'),
  // min_stock: z.number().min(0).optional(), // Not in Prisma Schema
  // max_stock: z.number().min(0).optional(), // Not in Prisma Schema
  location: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  // specifications: z.string().optional(), // Not in Prisma Schema
  cost: z.number().min(0).default(0),
  // status: z.enum(['active', 'inactive', 'discontinued']).default('active'), // Not in Prisma Schema
  // reorder_point: z.number().min(0).optional(), // Not in Prisma Schema
  // lead_time_days: z.number().min(0).optional(), // Not in Prisma Schema
  // notes: z.string().optional(), // Not in Prisma Schema
  created_by: z.string().uuid().optional().nullable()
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
    // Align with legacy frontend which might send 'projects' equivalent keys or extra fields
    const parse = inventorySchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Strict alignment with Prisma.InventoryCreateInput
    const inventoryData = {
      name: parse.data.name,
      code: parse.data.code || `INV-${Date.now()}`,
      category: parse.data.category,
      type: parse.data.type,
      quantity: parse.data.quantity,
      unit: parse.data.unit,
      cost: parse.data.cost,
      location: parse.data.location ?? null,
      supplier: parse.data.supplier ?? null,
      project_id: parse.data.project_id ?? null,
      description: parse.data.description ?? null,
      created_by: session.user.id // Audit
    }

    const inventory = await inventoryService.createInventory(inventoryData)

    return NextResponse.json({ success: true, data: inventory }, { status: 201 })
  } catch (error) {
    console.log('Envanter oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
