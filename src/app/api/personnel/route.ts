import { NextRequest, NextResponse } from 'next/server';
import { personnelService } from '@/lib/services/personnel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const personnelSchema = z.object({
  email: z.string().email('Geçerli bir email giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı.'),
  fullName: z.string().min(1, 'Ad soyad zorunlu.'),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const personnel = await personnelService.getAllPersonnel();
    return NextResponse.json({ success: true, data: personnel });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parse = personnelSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const person = await personnelService.createPersonnel(parse.data);
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 
