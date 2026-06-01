import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { name, email, phone, subject, message } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);

    if (user) {
      await prisma.grievance.create({
        data: { userId: user.id, subject, description: `From: ${name} (${phone || "no phone"})\n\n${message}` },
      });
    }

    return apiResponse({ message: "Your message has been received. We will respond within 24–48 hours." });
  } catch (err) {
    return handleApiError(err);
  }
}
