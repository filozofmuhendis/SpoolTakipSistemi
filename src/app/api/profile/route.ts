import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Use getServerSession for api routes if using NextAuth
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';

// Strict Zod schema for User Update
const updateProfileSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.').optional().nullable(),
    // role: z.string().optional() // Blocked for self-update
});

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } }, { status: 401 });
        }

        const body = await req.json();
        const result = updateProfileSchema.safeParse(body);

        if (!result.success) {
            // Validation error handling
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri.' } }, { status: 400 });
        }

        const { name } = result.data;

        // Strict alignment: only update if defined in payload. 
        // Prisma `exactOptionalPropertyTypes` requires we don't pass `undefined` to nullable fields.
        // We must pass `null` or valid value if we intend to update, or omit the key if undefined.
        // Since we spread `...(name !== undefined && { name })` previously, that was one way.
        // But `name` here can be `null`.

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData
        });

        return NextResponse.json(createSuccessResponse(user, 'Profil güncellendi.'));
    } catch (error) {
        const { response, status } = handleApiError(error);
        return NextResponse.json(response, { status });
    }
}
