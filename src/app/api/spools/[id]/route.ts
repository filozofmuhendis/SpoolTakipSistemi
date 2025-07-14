import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { spoolService } from '@/lib/services/spools'
import { z } from 'zod'

const urunAltKalemiUpdateSchema = z.object({
  name: z.string().min(1, 'Ürün alt kalemi adı gereklidir').optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  diameter: z.number().positive('Çap pozitif olmalıdır').optional(),
  thickness: z.number().positive('Kalınlık pozitif olmalıdır').optional(),
  length: z.number().positive('Uzunluk pozitif olmalıdır').optional(),
  weight: z.number().positive('Ağırlık pozitif olmalıdır').optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'shipped']).optional(),
  notes: z.string().optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const urunAltKalemi = await spoolService.getSpoolById(id)
    
    if (!urunAltKalemi) {
      return NextResponse.json(
        { success: false, error: 'Ürün alt kalemi bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: urunAltKalemi })
  } catch (error) {
    console.error('Ürün alt kalemi detay hatası:', error)
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
    const parse = urunAltKalemiUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await spoolService.updateSpool(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Ürün alt kalemi güncelleme hatası:', error)
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
    await spoolService.deleteSpool(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ürün alt kalemi silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 