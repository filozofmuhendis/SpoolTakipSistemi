import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Kullanıcı oluşturmayı dene (admin client ile)
    const { data, error } = await supabaseAdmin!.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split('@')[0]
      }
    })

    if (error) {
      console.log('Supabase Auth Error:', error)
      return NextResponse.json(
        { 
          error: 'Kullanıcı oluşturulamadı',
          details: error.message,
          code: error.status
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at
      }
    })

  } catch (error: any) {
    console.log('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Sunucu hatası',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Mevcut kullanıcıları listele
export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, position, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Profiles fetch error:', error)
      return NextResponse.json(
        { 
          error: 'Kullanıcılar getirilemedi',
          details: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      profiles: profiles || []
    })

  } catch (error: any) {
    console.log('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Sunucu hatası',
        details: error.message
      },
      { status: 500 }
    )
  }
}