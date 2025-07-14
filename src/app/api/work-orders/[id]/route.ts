import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { jobOrderService } from '@/lib/services/workOrders'
import { z } from 'zod'

const jobOrderUpdateSchema = z.object({
  description: z.string().min(1, 'Açıklama gereklidir').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  planned_start_date: z.string().optional(),
  planned_end_date: z.string().optional(),
  actual_start_date: z.string().optional(),
  actual_end_date: z.string().optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const jobOrder = await jobOrderService.getJobOrderById(id)
    
    if (!jobOrder) {
      return NextResponse.json(
        { success: false, error: 'İş emri bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: jobOrder })
  } catch (error) {
    console.error('İş emri detay hatası:', error)
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
    const parse = jobOrderUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await jobOrderService.updateJobOrder(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('İş emri güncelleme hatası:', error)
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
    await jobOrderService.deleteJobOrder(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('İş emri silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 