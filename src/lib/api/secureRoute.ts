import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { handleApiError } from './errorHandler';

type Role = 'admin' | 'manager' | 'user';

type HandlerFunction = (
    req: NextRequest,
    context: { params: any; session: any }
) => Promise<NextResponse>;

export function secureRoute(
    handler: HandlerFunction,
    allowedRoles: Role[] = ['admin', 'manager', 'user']
) {
    return async (req: NextRequest, context: { params: any }) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session || !session.user) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized: Authentication required' },
                    { status: 401 }
                );
            }

            const userRole = session.user.role as Role;

            if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden: Insufficient permissions' },
                    { status: 403 }
                );
            }

            // Inject session into context for convenience
            const enrichedContext = { ...context, session };

            return await handler(req, enrichedContext);
        } catch (error) {
            return handleApiError(error);
        }
    };
}
