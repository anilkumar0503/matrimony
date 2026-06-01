import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const communities = await prisma.community.findMany({
      include: { _count: { select: { members: { where: { status: "APPROVED" } } } } },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse({ communities });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { admin: _ } = await requireAdmin(req);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { name, description, category, logo, banner, isActive, metaTitle, metaDesc } = parsed.data;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    const community = await prisma.community.create({
      data: { name, slug, description, category, logo: logo || null, banner: banner || null, isActive, metaTitle, metaDesc },
    });

    return apiResponse({ community }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
