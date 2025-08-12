import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const personnelSchema = z.object({
  email: z.string().email('Geçerli bir email giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı.'),
  full_name: z.string().min(1, 'Ad soyad zorunlu.'),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

export async function GET(_req: NextRequest) {
  try {
    console.log('GET /api/personnel - Starting request');
    const { supabaseAdmin } = await import('@/lib/supabase');
    console.log('GET /api/personnel - SupabaseAdmin imported:', !!supabaseAdmin);
    
    if (!supabaseAdmin) {
      console.log('GET /api/personnel - SupabaseAdmin is null');
      return NextResponse.json({ success: false, error: 'Server yapılandırma hatası.' }, { status: 500 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    console.log('GET /api/personnel - Query result:', { data: data?.length, error });
    
    if (error) {
      console.log('GET /api/personnel - Supabase error:', error);
      throw new Error(error.message);
    }
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.log('GET /api/personnel - Catch error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('POST /api/personnel - Starting request');
  const session = await getServerSession(authOptions);
  console.log('POST /api/personnel - Session:', { user: session?.user?.email, role: session?.user?.role });
  
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    console.log('POST /api/personnel - Unauthorized access');
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const body = await req.json();
    console.log('POST /api/personnel - Request body:', body);
    
    const parse = personnelSchema.safeParse(body);
    if (!parse.success) {
      console.log('POST /api/personnel - Validation error:', parse.error.flatten().fieldErrors);
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    // Cast to the expected type for createPersonnel
    const personnelData = parse.data as {
      email: string
      password: string
      full_name: string
      phone?: string
      department?: string
      position?: string
    };
    
    const { supabaseAdmin } = await import('@/lib/supabase');
    console.log('POST /api/personnel - SupabaseAdmin imported:', !!supabaseAdmin);
    
    if (!supabaseAdmin) {
      console.log('POST /api/personnel - SupabaseAdmin is null');
      return NextResponse.json({ success: false, error: 'Server yapılandırma hatası.' }, { status: 500 });
    }

    // Önce auth.users'a kullanıcı oluştur
    console.log('POST /api/personnel - Creating user with data:', { email: personnelData.email, full_name: personnelData.full_name });
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: personnelData.email,
      password: personnelData.password,
      email_confirm: true,
      user_metadata: {
        full_name: personnelData.full_name,
        department: personnelData.department,
        position: personnelData.position
      }
    });

    console.log('POST /api/personnel - Auth user creation result:', { authData: !!authData?.user, authError });
    if (authError || !authData.user) {
      console.log('POST /api/personnel - Auth user creation failed:', authError);
      return NextResponse.json({ success: false, error: 'Kullanıcı oluşturulamadı.' }, { status: 500 });
    }

    // Sonra profiles tablosuna ekle
    console.log('POST /api/personnel - Using supabaseAdmin for profile creation');
    
    const profileData = {
      id: authData.user.id,
      email: personnelData.email,
      full_name: personnelData.full_name,
      phone: personnelData.phone,
      department: personnelData.department,
      position: personnelData.position
    };
    console.log('POST /api/personnel - Creating profile with data:', profileData);
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    console.log('POST /api/personnel - Profile creation result:', { data: !!data, error });
    if (error) {
      console.log('POST /api/personnel - Profile creation failed:', error);
      // Auth kullanıcısını sil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ success: false, error: 'Profil oluşturulamadı.' }, { status: 500 });
    }
    
    console.log('POST /api/personnel - Success, returning data:', data);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.log('POST /api/personnel - Catch error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
