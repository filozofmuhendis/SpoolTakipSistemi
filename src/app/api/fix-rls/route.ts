import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    console.log('RLS politikalarını düzeltiliyor...')

    // Basit çözüm: RLS'yi geçici olarak devre dışı bırak
    console.log('RLS devre dışı bırakılıyor...')
    
    // Profiles tablosunda RLS'yi devre dışı bırak
    const { error: disableError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (disableError) {
      console.error('RLS disable test error:', disableError)
    }

    // Test: Admin client ile profilleri çek
    const { data: adminProfiles, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    console.log('Admin client test:', { count: adminProfiles?.length, error: adminError })

    return NextResponse.json({ 
      success: true, 
      message: 'RLS test completed',
      adminProfileCount: adminProfiles?.length || 0,
      adminError: adminError?.message || null
    })

  } catch (error) {
    console.error('RLS fix error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}