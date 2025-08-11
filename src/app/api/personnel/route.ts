import { NextRequest, NextResponse } from 'next/server';
import { personnelService } from '@/lib/services/personnel';
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
    const personnel = await personnelService.getAllPersonnel();
    return NextResponse.json({ success: true, data: personnel });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parse = personnelSchema.safeParse(body);
    if (!parse.success) {
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
    
    const person = await personnelService.createPersonnel(personnelData);
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
