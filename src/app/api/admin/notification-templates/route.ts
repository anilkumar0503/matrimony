import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { eventKey: "asc" },
    });

    return apiResponse({ templates });
  } catch (err) {
    return handleApiError(err);
  }
}
