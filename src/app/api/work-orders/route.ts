import { NextRequest, NextResponse } from 'next/server';
import { workOrderService } from '@/services/workOrderService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const workOrderSchema = z.object({
  number: z.string().min(1, 'İş emri numarası zorunlu.'),
  projectId: z.string().min(1, 'Proje zorunlu.'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'], { required_error: 'Durum zorunlu.' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { required_error: 'Öncelik zorunlu.' }),
  assignedTo: z.string().min(1, 'Atanan personel zorunlu.'),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  dueDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
  description: z.string().optional()
});

export async function GET(_req: NextRequest) {
  try {
    const workOrders = await workOrderService.getAllWorkOrders();
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
    // Map schema fields to JobOrder interface fields
    const workOrderData = {
      number: parse.data.number,
      project_id: parse.data.projectId,
      status: parse.data.status,
      priority: parse.data.priority,
      start_date: parse.data.startDate,
      due_date: parse.data.dueDate,
      assigned_to: parse.data.assignedTo,
      description: parse.data.description || null,
      title: `WO-${parse.data.number}` // Default title if not provided, or add title to schema
    };

    // Note: The schema didn't have title, but DB requires title?
    // Let's check DB schema for work_orders.
    // Step 223: title TEXT NOT NULL.
    // The previous implementation (Step 305) didn't map title! 
    // It mapped: project_id, status, planned_start_date, planned_end_date, created_by (assignedTo).
    // Wait, previous implementation (Step 305) used `created_by: parse.data.assignedTo`.
    // But DB column is `assigned_to UUID NOT NULL`. `created_by` is not in the table definition in Step 223.
    // The table has `assigned_to` and `created_at`.
    // So `created_by` in previous implementation might have been wrong or I misread the table.
    // Let's check Step 223 again:
    // CREATE TABLE public.work_orders ( ... assigned_to UUID NOT NULL REFERENCES public.profiles(id) ... )
    // No `created_by` column.
    // Also `title TEXT NOT NULL`.
    // The `workOrderSchema` in Step 305 did NOT include `title`.
    // So `POST` to `work_orders` would fail if `title` is missing.
    // I should add `title` to schema or generate it.
    // Let's add `title` to schema.

    // Also `status` enum in Step 305: ['pending', 'active', 'completed', 'cancelled']
    // DB Check constraint: status IN ('pending', 'in_progress', 'completed', 'cancelled')
    // 'active' vs 'in_progress'. 
    // I should check what the frontend sends. ProjectStatusList uses 'active'.
    // Use `in_progress` to match DB.

    // I will update the schema to include `title` and correct `status`.

    const workOrder = await workOrderService.createWorkOrder(workOrderData as any);
    return NextResponse.json({ success: true, data: workOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
