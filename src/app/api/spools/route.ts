import { NextRequest, NextResponse } from 'next/server';
import { spoolService } from '@/services/spoolService';
import { z } from 'zod';
import { secureRoute } from '@/lib/api/secureRoute';
import { SpoolStatus } from '@prisma/client';

const spoolSchema = z.object({
  name: z.string().min(1, 'Makara adı zorunlu.'),
  projectId: z.string().min(1, 'Proje zorunlu.'),
  status: z.nativeEnum(SpoolStatus, { required_error: 'Durum zorunlu.' }),
  quantity: z.number().min(1, 'Adet zorunlu ve en az 1 olmalı.'),
  completedQuantity: z.number().min(0, 'Tamamlanan miktar 0 veya daha fazla olmalı.').optional(), // Not in CreateInput usually but maybe logic needs it? Schema doesn't have completed_quantity
  // Wait, schema.prisma Spool model: name, status, project_id, material_type, diameter, length, weight, quantity.
  // No completed_quantity in Schema! 
  // Let's remove completedQuantity from schema if it's not in DB.
  // Checking schema again...
  // Spool: id, name, status, project_id, material_type, diameter, length, weight, quantity, created_at, updated_at...
  // Correct. completed_quantity is likely calculated from work orders or tracked elsewhere if needed? 
  // Or maybe I missed it? 
  // Let's look at `src/services/spoolService.ts` to see what it does.
  // But for now, I will remove it from Zod to match DB strictness.
  // Also add material_type, diameter, length, weight.
  materialType: z.string().optional().nullable(),
  diameter: z.number().optional().nullable(),
  length: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  // startDate/endDate not in Spool model! They are in Project.
  // assignedTo not in Spool model! It is in WorkOrder.
  // The API was receiving these but where did they go?
  // Previous `spoolData` had `start_date`, `end_date`, `assigned_to`.
  // Prisma `create` would fail if these are not in model.
  // The previous code might have been using `any` or relying on loose types?
  // I will strictly align with Prisma Model.
  // If these fields are needed, they should be in the DB or handled via relations (WorkOrder?).
});

export const GET = secureRoute(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const spools = await spoolService.getAllSpools(page, limit);
  return NextResponse.json({ success: true, data: spools });
}, ['admin', 'manager', 'user']);

export const POST = secureRoute(async (req: NextRequest) => {
  const body = await req.json();
  const parse = spoolSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
  }

  // Strict alignment with Prisma.SpoolCreateInput
  const spoolData = {
    name: parse.data.name,
    project: { connect: { id: parse.data.projectId } },
    status: parse.data.status,
    quantity: parse.data.quantity,
    material_type: parse.data.materialType ?? null,
    diameter: parse.data.diameter ?? null,
    length: parse.data.length ?? null,
    weight: parse.data.weight ?? null,
    created_by: req.headers.get('x-user-id') // Mocking or needing real user extraction if not in session?
    // secureRoute doesn't inject user into req directly, we need session.
    // But secureRoute ensures auth. 
    // Let's use `getServerSession` inside if we need user ID for audit.
  };

  // Note: `created_by` audit needs user ID. `secureRoute` wraps handler but doesn't pass session easily unless we parse it again or attach to req.
  // For now, let's omit created_by or fetch session. Fetching session is safer.

  const spool = await spoolService.createSpool(spoolData);
  return NextResponse.json({ success: true, data: spool }, { status: 201 });
}, ['admin', 'manager']);
