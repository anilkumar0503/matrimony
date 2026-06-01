import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || "15m") as string;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || "7d") as string;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "user" | "admin";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "user" | "admin";
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

export function decodeToken<T>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
