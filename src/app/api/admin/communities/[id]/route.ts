import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  logo: z.string().url().optional().nullable().or(z.literal("")),
  banner: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { logo, banner, ...rest } = parsed.data;
    const community = await prisma.community.update({
      where: { id: params.id },
      data: { ...rest, logo: logo === "" ? null : logo, banner: banner === "" ? null : banner },
    });

    return apiResponse({ community });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    await prisma.community.delete({ where: { id: params.id } });
    return apiResponse({ message: "Community deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);

    const pending = await prisma.communityMember.findMany({
      where: { communityId: params.id, status: "PENDING" },
      include: { user: { include: { profile: { select: { fullName: true } } } } },
    });

    return apiResponse({ pending });
  } catch (err) {
    return handleApiError(err);
  }
}
