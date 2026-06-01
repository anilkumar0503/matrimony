import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where = { userId: user.id, channel: "IN_APP" as const, ...(unreadOnly ? { isRead: false } : {}) };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, channel: "IN_APP", isRead: false } }),
    ]);

    return apiResponse({ notifications, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

const markSchema = z.object({ ids: z.array(z.string()).optional(), all: z.boolean().optional() });

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = markSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid request", 400);

    if (parsed.data.all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, channel: "IN_APP", isRead: false },
        data: { isRead: true },
      });
      return apiResponse({ message: "All notifications marked as read." });
    }

    if (parsed.data.ids?.length) {
      await prisma.notification.updateMany({
        where: { id: { in: parsed.data.ids }, userId: user.id },
        data: { isRead: true },
      });
    }

    return apiResponse({ message: "Marked as read." });
  } catch (err) {
    return handleApiError(err);
  }
}
