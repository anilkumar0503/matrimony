import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; reset: number }>();

const RATE_LIMIT_RULES: { pattern: RegExp; limit: number; windowMs: number }[] = [
  { pattern: /^\/api\/auth\/login/, limit: 10, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/register/, limit: 5, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/forgot-password/, limit: 5, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/refresh/, limit: 30, windowMs: 60_000 },
  { pattern: /^\/api\/user\/interests/, limit: 20, windowMs: 60_000 },
  { pattern: /^\/api\//, limit: 120, windowMs: 60_000 },
];

function getClientKey(req: NextRequest, path: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${path}`;
}

function getRuleForPath(path: string) {
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(path)) return rule;
  }
  return null;
}

export function middleware(req: NextRequest) {
  // Rate limiting disabled
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
