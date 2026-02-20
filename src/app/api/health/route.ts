import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import os from 'os';

export async function GET() {
    const start = Date.now();
    try {
        // Check DB Connection
        await prisma.$queryRaw`SELECT 1`;

        const duration = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            db_latency_ms: duration,
            system: {
                load_avg: os.loadavg(),
                memory_usage: process.memoryUsage(),
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Health Check Failed');
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
        }, { status: 503 });
    }
}
