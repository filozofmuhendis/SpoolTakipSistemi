import { NextRequest, NextResponse } from 'next/server';
import { shipmentService } from '@/lib/services/shipments';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const shipmentSchema = z.object({
  number: z.string().min(1, 'Sevkiyat numarası zorunlu.'),
  projectId: z.string().min(1, 'Proje zorunlu.'),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled'], { required_error: 'Durum zorunlu.' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { required_error: 'Öncelik zorunlu.' }),
  destination: z.string().min(1, 'Varış noktası zorunlu.'),
  scheduledDate: z.string().min(1, 'Planlanan tarih zorunlu.'),
  actualDate: z.string().optional(),
  carrier: z.string().min(1, 'Taşıyıcı zorunlu.'),
  trackingNumber: z.string().optional(),
  totalWeight: z.number().min(0, 'Toplam ağırlık zorunlu ve 0 veya daha fazla olmalı.')
});

export async function GET(req: NextRequest) {
  try {
    const shipments = await shipmentService.getAllShipments();
    return NextResponse.json({ success: true, data: shipments });
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
    const parse = shipmentSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const shipment = await shipmentService.createShipment(parse.data);
    return NextResponse.json({ success: true, data: shipment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 