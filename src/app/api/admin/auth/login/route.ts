import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { comparePassword, generateSecureToken } from "@/lib/encryption";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth/login");
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, password } = parsed.data;
    const ip = getClientIp(req);

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!admin || !admin.isActive) {
      return apiError("Invalid credentials or account inactive", 401, "INVALID_CREDENTIALS");
    }

    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) return apiError("Invalid credentials", 401, "INVALID_CREDENTIALS");

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "ADMIN_LOGIN",
        ipAddress: ip,
        details: { email },
      },
    });

    const permissions = admin.role.rolePermissions.map(
      (rp: { permission: { code: string } }) => rp.permission.code
    );

    const refreshToken = generateSecureToken();
    const accessToken = signAccessToken({ sub: admin.id, email: admin.email, type: "admin" });
    const rToken = signRefreshToken({ sub: admin.id, sessionId: refreshToken, type: "admin" });

    return apiResponse({
      accessToken,
      refreshToken: rToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role.name,
        permissions,
      },
    });
  } catch (err) {
    console.error(err);
    return apiError("Login failed. Please try again.", 500);
  }
}
