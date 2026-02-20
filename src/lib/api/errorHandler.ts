import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    // 1. Zod Validation Errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                success: false,
                error: 'Validation Error',
                details: error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    // 2. Prisma Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002': // Unique constraint violation
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Conflict: Resource already exists',
                        code: 'RESOURCE_EXISTS',
                    },
                    { status: 409 }
                );
            case 'P2025': // Record not found
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Not Found: Resource does not exist',
                        code: 'RESOURCE_NOT_FOUND',
                    },
                    { status: 404 }
                );
            case 'P2003': // Foreign key constraint violation
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Conflict: Invalid reference to related resource',
                        code: 'FOREIGN_KEY_VIOLATION',
                    },
                    { status: 409 }
                );
            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Database Error',
                        code: error.code,
                    },
                    { status: 500 }
                );
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
            {
                success: false,
                error: 'Database Validation Error',
            },
            { status: 400 }
        );
    }

    // 3. Application Errors (Custom threw Error)
    if (error instanceof Error) {
        // Check for specific custom error messages if needed, or return generic
        if (error.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        if (error.message === 'Forbidden') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 } // Or 400 depending on error strategy
        );
    }

    // 4. Unknown Errors
    return NextResponse.json(
        {
            success: false,
            error: 'Internal Server Error',
        },
        { status: 500 }
    );
}
