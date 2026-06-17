import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return apiError("Role not found", 404);
    if (!existing.isEditable) return apiError("This role cannot be edited", 403);

    const { permissionIds, ...rest } = parsed.data;

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...rest,
        rolePermissions: permissionIds !== undefined
          ? {
              deleteMany: {},
              create: permissionIds.map(permissionId => ({ permissionId })),
            }
          : undefined,
      },
      include: { rolePermissions: { include: { permission: true } } },
    });

    return apiResponse({ role });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return apiError("Role not found", 404);
    if (!existing.isEditable) return apiError("This role cannot be deleted", 403);

    const usersWithRole = await prisma.adminUser.count({ where: { roleId: id } });
    if (usersWithRole > 0) return apiError(`Cannot delete: ${usersWithRole} admin(s) are assigned this role`, 400);

    await prisma.role.delete({ where: { id } });
    return apiResponse({ message: "Role deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
