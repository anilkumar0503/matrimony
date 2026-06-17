import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { setSetting, getAllSettings } from "@/lib/platform-settings";
import { redis, CACHE_KEYS } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.SETTINGS_SYSTEM_CONFIG]);
    const settings = await getAllSettings();

    // Mask secrets
    const masked = Object.fromEntries(
      Object.entries(settings).map(([k, v]) => {
        const isSecret =
          k.includes("secret") || k.includes("key") || k.includes("password") || k.includes("api_key");
        return [k, isSecret ? "••••••••" : v];
      })
    );

    return apiResponse({ settings: masked });
  } catch (err) {
    return handleApiError(err);
  }
}

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  isSecret: z.boolean().optional(),
});

const bulkSchema = z.object({
  settings: z.array(settingSchema),
});

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.SETTINGS_SYSTEM_CONFIG]);
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    for (const s of parsed.data.settings) {
      await setSetting(s.key as Parameters<typeof setSetting>[0], s.value, admin.id, s.isSecret);
    }

    await redis?.del(CACHE_KEYS.platformSettings());

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "SETTINGS_CHANGED",
        details: { keys: parsed.data.settings.map((s) => s.key) },
      },
    });

    return apiResponse({ message: "Settings updated successfully." });
  } catch (err) {
    return handleApiError(err);
  }
}
