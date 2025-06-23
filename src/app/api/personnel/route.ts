import { NextRequest, NextResponse } from 'next/server';
import { personnelService } from '@/lib/services/personnel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const personnelSchema = z.object({
  name: z.string().min(1, 'Personel adı zorunlu.'),
  role: z.string().min(1, 'Rol zorunlu.'),
  email: z.string().email('Geçerli bir email giriniz.'),
  phone: z.string().min(1, 'Telefon zorunlu.'),
  position: z.string().min(1, 'Pozisyon zorunlu.'),
  department: z.string().min(1, 'Departman zorunlu.'),
  status: z.enum(['active', 'inactive', 'on_leave'], { required_error: 'Durum zorunlu.' }),
  hireDate: z.string().min(1, 'İşe giriş tarihi zorunlu.')
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