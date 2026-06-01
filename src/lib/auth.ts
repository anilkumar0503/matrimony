import { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "./jwt";
import prisma from "./prisma";
import type { Permission } from "./permissions";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 401
  ) {
    super(message);
  }
}

export async function getAuthUser(req: NextRequest): Promise<AccessTokenPayload> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) throw new AuthError("NO_TOKEN", "Authentication required");

  try {
    return verifyAccessToken(token);
  } catch {
    throw new AuthError("INVALID_TOKEN", "Invalid or expired token");
  }
}

export async function requireAdmin(
  req: NextRequest,
  requiredPermissions?: Permission[]
): Promise<{ admin: NonNullable<Awaited<ReturnType<typeof prisma.adminUser.findUnique>>>; permissions: string[] }> {
  const payload = await getAuthUser(req);
  if (payload.type !== "admin") throw new AuthError("FORBIDDEN", "Admin access required", 403);

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!admin || !admin.isActive) throw new AuthError("FORBIDDEN", "Account suspended", 403);

  const permissions = admin.role.rolePermissions.map((rp) => rp.permission.code);

  if (requiredPermissions?.length) {
    const hasAll = requiredPermissions.every((p) => permissions.includes(p));
    if (!hasAll) throw new AuthError("FORBIDDEN", "Insufficient permissions", 403);
  }

  return { admin, permissions };
}

export async function requireUser(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (payload.type !== "user") throw new AuthError("FORBIDDEN", "User access required", 403);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      status: true,
      gender: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) throw new AuthError("NOT_FOUND", "User not found", 404);
  if (user.status === "SUSPENDED") throw new AuthError("SUSPENDED", "Account suspended", 403);
  if (user.status === "DELETED") throw new AuthError("DELETED", "Account deleted", 410);

  return user;
}

export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, code?: string) {
  return Response.json({ success: false, error: message, code }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.statusCode, error.code);
  }
  console.error(error);
  return apiError("Internal server error", 500, "INTERNAL_ERROR");
}
