import { NextRequest } from "next/server";
import { getAuthUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getSignedDownloadUrl, isPrivateKey } from "@/lib/storage";

// Allowed prefixes for signed URL access
const ALLOWED_PREFIXES = ["users/", "invoices/", "exports/"];

export async function GET(req: NextRequest) {
  try {
    // Require authentication (user or admin token)
    const payload = await getAuthUser(req);

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const expiresIn = Math.min(parseInt(searchParams.get("expires") || "3600"), 86400); // max 24h

    if (!key) return apiError("key is required", 400);

    // Only allow private keys
    if (!isPrivateKey(key)) return apiError("Cannot generate signed URL for public files", 400);

    // Validate key is from an allowed prefix
    const isAllowed = ALLOWED_PREFIXES.some(prefix => key.startsWith(prefix));
    if (!isAllowed) return apiError("Access denied for this key", 403);

    // If user (non-admin), restrict to their own files only
    if (payload.type === "user") {
      const userId = payload.sub;
      if (!key.startsWith(`users/${userId}/`)) {
        return apiError("Access denied: you can only access your own files", 403);
      }
    }

    const url = await getSignedDownloadUrl(key, expiresIn);
    return apiResponse({ url, expiresIn });
  } catch (err) {
    return handleApiError(err);
  }
}
