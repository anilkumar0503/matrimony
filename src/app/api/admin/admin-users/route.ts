import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import bcrypt from "bcryptjs";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  roleId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_VIEW]);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search");
    const roleId = searchParams.get("roleId");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    if (roleId) where.roleId = roleId;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const [adminUsers, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        include: {
          role: {
            select: { id: true, name: true, description: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.adminUser.count({ where }),
    ]);

    // Remove sensitive data
    const safeAdmins = adminUsers.map((admin) => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roleId: admin.roleId,
      role: admin.role,
      isActive: admin.isActive,
      totpEnabled: admin.totpEnabled,
      lastLoginAt: admin.lastLoginAt,
      lastLoginIp: admin.lastLoginIp,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));

    return apiResponse({
      adminUsers: safeAdmins,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_EDIT]);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { email, password, name, roleId } = parsed.data;

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) return apiError("Email already exists", 409);

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return apiError("Role not found", 404);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        roleId,
      },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    // Remove sensitive data
    const safeAdmin = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      roleId: adminUser.roleId,
      role: adminUser.role,
      isActive: adminUser.isActive,
      totpEnabled: adminUser.totpEnabled,
      createdAt: adminUser.createdAt,
    };

    return apiResponse({ adminUser: safeAdmin }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
