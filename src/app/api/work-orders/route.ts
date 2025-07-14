import { NextRequest, NextResponse } from 'next/server';
import { jobOrderService } from '@/lib/services/workOrders';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const workOrderSchema = z.object({
  number: z.string().min(1, 'İş emri numarası zorunlu.'),
  projectId: z.string().min(1, 'Proje zorunlu.'),
  status: z.enum(['pending', 'active', 'completed', 'cancelled'], { required_error: 'Durum zorunlu.' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { required_error: 'Öncelik zorunlu.' }),
  assignedTo: z.string().min(1, 'Atanan personel zorunlu.'),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  dueDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
  description: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const workOrders = await jobOrderService.getAllJobOrders();
    return NextResponse.json({ success: true, data: workOrders });
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
    const parse = workOrderSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const workOrder = await jobOrderService.createJobOrder(parse.data);
    return NextResponse.json({ success: true, data: workOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 
