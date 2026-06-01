import { NextRequest } from "next/server";
import { incrementWithExpiry } from "./redis";
import { apiError } from "./auth";

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  "auth/register": { windowSeconds: 3600, maxRequests: 5 },
  "auth/login": { windowSeconds: 900, maxRequests: 10 },
  "auth/otp": { windowSeconds: 3600, maxRequests: 5 },
  "api/default": { windowSeconds: 60, maxRequests: 60 },
};

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimit(req: NextRequest, route: string): Promise<Response | null> {
  const ip = getClientIp(req);
  const config = LIMITS[route] || LIMITS["api/default"];
  const key = `rl:${ip}:${route}`;

  const count = await incrementWithExpiry(key, config.windowSeconds);

  if (count > config.maxRequests) {
    return apiError(
      `Too many requests. Please try again in ${config.windowSeconds} seconds.`,
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  }

  return null;
}
