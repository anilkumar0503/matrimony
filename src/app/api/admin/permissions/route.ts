import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { code: "asc" }],
    });

    return apiResponse({ permissions });
  } catch (err) {
    return handleApiError(err);
  }
}
