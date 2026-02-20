import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !redisUrl) {
    throw new Error('REDIS_URL is mandatory in production environment for rate limiting.');
}

const redis = redisUrl ? new Redis(redisUrl) : null;

if (!redis && isProduction) {
    // This should technically never happen due to the throw above, 
    // but added for type safety and clarity.
    console.error('CRITICAL: Redis connection failed in production.');
}

export default redis;
