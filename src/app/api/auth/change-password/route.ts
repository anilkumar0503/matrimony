import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { redis } from "@/lib/redis";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { currentPassword, newPassword } = parsed.data;

    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!fullUser?.passwordHash) return apiError("Invalid account type", 400);

    const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
    if (!valid) return apiError("Current password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashed } });

    await redis?.del(`sessions:${user.id}`);

    return apiResponse({ message: "Password updated successfully. Please log in again." });
  } catch (err) {
    return handleApiError(err);
  }
}
