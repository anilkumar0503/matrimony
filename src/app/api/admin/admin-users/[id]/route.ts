import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(2).optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_VIEW]);
    const { id } = await params;

    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!adminUser) return apiError("Admin user not found", 404);

    // Remove sensitive data
    const safeAdmin = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      roleId: adminUser.roleId,
      role: adminUser.role,
      isActive: adminUser.isActive,
      totpEnabled: adminUser.totpEnabled,
      lastLoginAt: adminUser.lastLoginAt,
      lastLoginIp: adminUser.lastLoginIp,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    };

    return apiResponse({ adminUser: safeAdmin });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_EDIT]);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { email, password, name, roleId, isActive } = parsed.data;

    // Check if admin exists
    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) return apiError("Admin user not found", 404);

    // If changing email, check if new email already exists
    if (email && email !== existing.email) {
      const emailExists = await prisma.adminUser.findUnique({ where: { email } });
      if (emailExists) return apiError("Email already exists", 409);
    }

    // If changing role, verify role exists
    if (roleId && roleId !== existing.roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) return apiError("Role not found", 404);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (roleId) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
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
      lastLoginAt: adminUser.lastLoginAt,
      lastLoginIp: adminUser.lastLoginIp,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    };

    return apiResponse({ adminUser: safeAdmin });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_DELETE]);
    const { id } = await params;

    // Check if admin exists
    const existing = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!existing) return apiError("Admin user not found", 404);

    // Prevent deleting the last super admin
    const superAdminCount = await prisma.adminUser.count({
      where: {
        role: { name: "SUPER_ADMIN" },
        isActive: true,
      },
    });

    if (existing.role.name === "SUPER_ADMIN" && superAdminCount <= 1) {
      return apiError("Cannot delete the last super admin", 400);
    }

    await prisma.adminUser.delete({ where: { id } });

    return apiResponse({ message: "Admin user deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
