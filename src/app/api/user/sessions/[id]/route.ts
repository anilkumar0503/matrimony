import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, handleApiError } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session || session.userId !== user.id) return apiResponse({ success: false, error: "Session not found" }, 404);
    await prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
    return apiResponse({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
