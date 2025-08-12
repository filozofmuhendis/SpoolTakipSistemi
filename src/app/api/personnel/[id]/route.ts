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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = params
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Personel bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.log('Personel detay hatası:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = params
    const body = await req.json()
    const parse = personnelUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(parse.data).filter(([_, value]) => value !== undefined)
    )
    
    const updated = await personnelService.updatePersonnel(id, updateData)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.log('Personel güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = params
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Server yapılandırma hatası.' }, { status: 500 })
    }

    // Auth kullanıcısını sil
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError) {
      return NextResponse.json({ success: false, error: 'Kullanıcı silinemedi.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log('Personel silme hatası:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}