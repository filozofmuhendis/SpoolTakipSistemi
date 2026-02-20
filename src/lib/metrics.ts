import redis from './redis';

export interface AuthMetrics {
    login_attempt_rate: number;
    auth_latency_p95: number;
    auth_error_rate: number;
}

export async function recordLoginAttempt(success: boolean, latencyMs: number, errorCode?: string) {
    const now = Math.floor(Date.now() / 1000);
    const minute = Math.floor(now / 60);

    if (redis) {
        try {
            const pipeline = redis.pipeline();

            // Rate tracking (increment counter for current minute)
            pipeline.incr(`metrics:login_attempts:${minute}`);
            pipeline.expire(`metrics:login_attempts:${minute}`, 3600);

            if (!success) {
                pipeline.incr(`metrics:login_errors:${minute}`);
                pipeline.expire(`metrics:login_errors:${minute}`, 3600);
            }

            // Latency tracking (push to list for sliding window)
            pipeline.lpush(`metrics:login_latency:${minute}`, latencyMs.toString());
            pipeline.ltrim(`metrics:login_latency:${minute}`, 0, 999); // Keep last 1000
            pipeline.expire(`metrics:login_latency:${minute}`, 3600);

            await pipeline.exec();
        } catch (error) {
            console.error('Failed to record metrics to Redis:', error);
        }
    } else {
        // Fallback or log-based metrics for dev
        console.log(`[METRIC] Login - Success: ${success}, Latency: ${latencyMs}ms, Error: ${errorCode || 'none'}`);
    }
}

export async function getRecentAuthMetrics(): Promise<AuthMetrics> {
    const now = Math.floor(Date.now() / 1000);
    const minute = Math.floor(now / 60);

    if (!redis) {
        return { login_attempt_rate: 0, auth_latency_p95: 0, auth_error_rate: 0 };
    }

    const [attempts, errors, latencies] = await Promise.all([
        redis.get<string>(`metrics:login_attempts:${minute}`),
        redis.get<string>(`metrics:login_errors:${minute}`),
        redis.lrange<string>(`metrics:login_latency:${minute}`, 0, -1)
    ]);

    const attemptCount = parseInt(attempts || '0');
    const errorCount = parseInt(errors || '0');

    // Calculate P95 latency
    const sortedLatencies = (latencies || []).map(Number).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95 = sortedLatencies.length > 0 ? (sortedLatencies[p95Index] ?? 0) : 0;

    return {
        login_attempt_rate: attemptCount / 60, // per second avg for this minute
        auth_latency_p95: p95,
        auth_error_rate: attemptCount > 0 ? (errorCount / attemptCount) * 100 : 0
    };
}
