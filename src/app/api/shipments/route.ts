import { NextRequest, NextResponse } from 'next/server';
import { shipmentService } from '@/services/shipmentService';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, createValidationErrorResponse } from '@/lib/api-response';
import { ShipmentStatus } from '@prisma/client';

const shipmentSchema = z.object({
  project_id: z.string().min(1, 'Proje seçilmelidir'),
  shipment_date: z.string().min(1, 'Tarih gereklidir'), // ISO string expected
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(ShipmentStatus).optional()
});

export async function GET() {
  try {
    const shipments = await shipmentService.getAllShipments();
    return NextResponse.json(createSuccessResponse(shipments));
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = shipmentSchema.safeParse(body);

    if (!result.success) {
      const validationErrors: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      const { response, status } = createValidationErrorResponse(validationErrors);
      return NextResponse.json(response, { status });
    }

    const shipment = await shipmentService.createShipment({
      project: { connect: { id: result.data.project_id } },
      shipment_date: new Date(result.data.shipment_date),
      notes: result.data.notes ?? null,       // Handle nullable strictness
      status: result.data.status ?? 'pending' // Default to enum 'pending'
    });
    return NextResponse.json(createSuccessResponse(shipment), { status: 201 });
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: { message: 'ID required', code: 'MISSING_ID' } }, { status: 400 });
  }

  try {
    const body = await req.json();
    // Simple update logic, validation can be added
    const shipment = await shipmentService.updateShipment(id, body);
    return NextResponse.json(createSuccessResponse(shipment));
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: { message: 'ID required', code: 'MISSING_ID' } }, { status: 400 });
  }

  try {
    await shipmentService.deleteShipment(id);
    return NextResponse.json(createSuccessResponse(null, 'Shipment deleted'));
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
