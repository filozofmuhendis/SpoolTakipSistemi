import redis from './redis';

const loginRateLimitStore = new Map<string, number[]>();

export async function isRateLimited(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const threshold = now - windowMs;

    // Use Redis if available
    if (redis) {
        const redisKey = `rate_limit:${key}`;
        try {
            // Sliding window using Redis Sorted Set (ZSET)
            const multi = redis.multi();
            multi.zremrangebyscore(redisKey, 0, threshold);
            multi.zadd(redisKey, now, now.toString());
            multi.zcard(redisKey);
            multi.expire(redisKey, windowSeconds);

            const results = await multi.exec();
            if (!results || !results[2]) return false;

            const count = results[2][1] as number;
            return count > limit;
        } catch (error) {
            console.error('Rate limit error (Redis):', error);
            // Fallback to in-memory in dev, but strictly enforce in prod if possible
            // For now, let's allow fallback but log warning
            if (process.env.NODE_ENV === 'production') return true; // Fail closed in prod
        }
    }

    // In-memory fallback for development
    const timestamps = loginRateLimitStore.get(key) || [];
    const recentTimestamps = timestamps.filter(t => t > threshold);

    if (recentTimestamps.length >= limit) {
        return true;
    }

    recentTimestamps.push(now);
    loginRateLimitStore.set(key, recentTimestamps);
    return false;
}
