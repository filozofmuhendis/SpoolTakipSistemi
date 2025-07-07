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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const spool = await spoolService.getSpoolById(id);
    if (!spool) {
      return NextResponse.json({ success: false, error: 'Makara bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: spool });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const { id } = params;
    const body = await req.json();
    const parse = spoolSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const updated = await spoolService.updateSpool(id, parse.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const { id } = params;
    await spoolService.deleteSpool(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 