import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { personnelService } from '@/lib/services/personnel'
import { z } from 'zod'

const personnelUpdateSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad gereklidir').optional(),
  email: z.string().email('Geçerli bir email giriniz').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const personnel = await personnelService.getPersonnelById(id)
    
    if (!personnel) {
      return NextResponse.json(
        { success: false, error: 'Personel bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: personnel })
  } catch (error) {
    console.error('Personel detay hatası:', error)
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
    const parse = personnelUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await personnelService.updatePersonnel(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Personel güncelleme hatası:', error)
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
    await personnelService.deletePersonnel(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Personel silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 