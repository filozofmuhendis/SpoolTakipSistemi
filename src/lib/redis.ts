import { Redis } from '@upstash/redis';

const isProduction = process.env.NODE_ENV === 'production';

// Upstash Redis client (Edge compatible)
// Automatically uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
let redis: Redis | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    } else if (isProduction) {
        console.warn('CRITICAL: Upstash Redis credentials missing in production.');
    }
} catch (error) {
    console.error('Failed to initialize Upstash Redis:', error);
}

export default redis;
