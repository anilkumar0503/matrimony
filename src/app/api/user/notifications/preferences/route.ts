import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const prefs = await prisma.notificationPreference.findMany({ where: { userId: user.id } });

    return apiResponse({ preferences: prefs });
  } catch (err) {
    return handleApiError(err);
  }
}

const schema = z.object({
  preferences: z.record(z.string(), z.boolean()),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { preferences } = parsed.data;

    await Promise.all(
      Object.entries(preferences).map(([eventKey, enabled]) =>
        prisma.notificationPreference.upsert({
          where: { userId_eventKey: { userId: user.id, eventKey } },
          create: { userId: user.id, eventKey, email: enabled, inApp: enabled, sms: enabled },
          update: { email: enabled, inApp: enabled, sms: enabled },
        })
      )
    );

    return apiResponse({ message: "Notification preferences updated" });
  } catch (err) {
    return handleApiError(err);
  }
}
