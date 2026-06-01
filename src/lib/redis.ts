import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | null };

let redisInstance: Redis | null = null;

try {
  redisInstance = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    },
  });

  redisInstance.on("error", (err) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("Redis connection failed, running without cache:", err.message);
    }
  });
} catch (err) {
  if (process.env.NODE_ENV === "development") {
    console.warn("Redis not available, running without cache");
  }
}

export const redis = redisInstance;

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisInstance;

export default redisInstance;

export const CACHE_KEYS = {
  userSession: (userId: string) => `session:user:${userId}`,
  adminSession: (adminId: string) => `session:admin:${adminId}`,
  otpAttempts: (email: string, purpose: string) => `otp:attempts:${email}:${purpose}`,
  rateLimitApi: (ip: string, route: string) => `rl:${ip}:${route}`,
  platformSettings: () => `platform:settings`,
  fieldVisibility: () => `field:visibility`,
  profileView: (viewerId: string, viewedId: string) => `pv:${viewerId}:${viewedId}`,
} as const;

export async function setWithExpiry(key: string, value: string, ttlSeconds: number) {
  if (!redis) return;
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (err) {
    // Silent fail in development
  }
}

export async function getOrNull(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    return null;
  }
}

export async function deleteKey(key: string) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    // Silent fail
  }
}

export async function incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
  if (!redis) return 1;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, ttlSeconds);
    return count;
  } catch (err) {
    return 1;
  }
}
