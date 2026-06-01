import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  label: z.string().min(1).optional(),
  emailSubject: z.string().optional().nullable(),
  emailBody: z.string().optional().nullable(),
  smsBody: z.string().max(160).optional().nullable(),
  inAppBody: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const template = await prisma.notificationTemplate.update({
      where: { id: params.id },
      data: { ...parsed.data, version: { increment: 1 } },
    });

    return apiResponse({ template });
  } catch (err) {
    return handleApiError(err);
  }
}
