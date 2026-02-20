import { NextRequest, NextResponse } from 'next/server';
import { materialService } from '@/services/materialService';
import { z } from 'zod';
import { secureRoute } from '@/lib/api/secureRoute';

// Schema for validation
const materialSchema = z.object({
    name: z.string().min(1, 'Malzeme adı zorunlu'),
    type: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    stock_quantity: z.number().min(0, 'Stok miktarı negatif olamaz').optional()
});

export const GET = secureRoute(async () => {
    const materials = await materialService.getAllMaterials();
    return NextResponse.json({ success: true, data: materials });
}, ['admin', 'manager', 'user']);

export const POST = secureRoute(async (req: NextRequest) => {
    const body = await req.json();
    const result = materialSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    // Strict alignment with Prisma.MaterialCreateInput
    const materialData = {
        name: result.data.name,
        type: result.data.type ?? null,
        unit: result.data.unit ?? null,
        stock_quantity: result.data.stock_quantity ?? 0
    };

    const material = await materialService.createMaterial(materialData);
    return NextResponse.json({ success: true, data: material }, { status: 201 });
}, ['admin', 'manager']);

export const PUT = secureRoute(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const body = await req.json();
    const material = await materialService.updateMaterial(id, body);
    return NextResponse.json({ success: true, data: material });
}, ['admin', 'manager']);

export const DELETE = secureRoute(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await materialService.deleteMaterial(id);
    return NextResponse.json({ success: true, message: 'Material deleted' });
}, ['admin']);
