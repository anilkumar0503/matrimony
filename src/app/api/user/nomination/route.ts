import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const nominationSchema = z.object({
  name: z.string().min(2).max(100),
  relationship: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = nominationSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { name, relationship, phone, email } = parsed.data;

    const nomination = await prisma.nomination.upsert({
      where: { userId: user.id },
      create: { userId: user.id, nomineeName: name, nomineeEmail: email, nomineePhone: phone, relation: relationship },
      update: { nomineeName: name, nomineeEmail: email, nomineePhone: phone, relation: relationship },
    });

    return apiResponse({ nomination }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const nomination = await prisma.nomination.findUnique({ where: { userId: user.id } });
    return apiResponse({ nomination });
  } catch (err) {
    return handleApiError(err);
  }
}
