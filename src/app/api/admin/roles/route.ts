import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { adminUsers: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return apiResponse({ roles });
  } catch (err) {
    return handleApiError(err);
  }
}

const schema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { name, description, permissionIds } = parsed.data;

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) return apiError("Role name already exists", 409);

    const role = await prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: permissionIds?.length
          ? { create: permissionIds.map(permissionId => ({ permissionId })) }
          : undefined,
      },
      include: { rolePermissions: { include: { permission: true } } },
    });

    return apiResponse({ role }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
