import { NextRequest, NextResponse } from 'next/server';
import { spoolService } from '@/lib/services/spools';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const spoolSchema = z.object({
  name: z.string().min(1, 'Makara adı zorunlu.'),
  projectId: z.string().min(1, 'Proje zorunlu.'),
  status: z.enum(['pending', 'active', 'completed'], { required_error: 'Durum zorunlu.' }),
  quantity: z.number().min(1, 'Adet zorunlu ve en az 1 olmalı.'),
  completedQuantity: z.number().min(0, 'Tamamlanan miktar 0 veya daha fazla olmalı.'),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  endDate: z.string().optional(),
  assignedTo: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const spools = await spoolService.getAllSpools();
    return NextResponse.json({ success: true, data: spools });
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
    const parse = spoolSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const spool = await spoolService.createSpool(parse.data);
    return NextResponse.json({ success: true, data: spool }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 