import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, createValidationErrorResponse } from '@/lib/api-response';

const registerSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

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

        const { email, password, name } = result.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: {
                    message: 'Bu e-posta adresi zaten kullanımda.',
                    code: 'USER_EXISTS'
                }
            }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'user', // Default role
                status: 'active'
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        const response = createSuccessResponse(userWithoutPassword, 'Kayıt başarılı. Giriş yapabilirsiniz.');
        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        const { response, status } = handleApiError(error);
        return NextResponse.json(response, { status });
    }
}
