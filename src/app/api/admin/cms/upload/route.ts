import { NextRequest } from "next/server";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { uploadPublicFile, getPublicUrl, PUBLIC_FOLDERS } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "cms";

    if (!file) return apiError("No file provided", 400);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return apiError(`File too large. Max ${MAX_SIZE_MB}MB.`, 400);
    if (!ALLOWED_TYPES.includes(file.type)) return apiError("Only image files are allowed", 400);

    // Determine storage folder
    let storageFolder: string;
    switch (folder) {
      case "testimonials":
        storageFolder = PUBLIC_FOLDERS.testimonials();
        break;
      case "banners":
        storageFolder = PUBLIC_FOLDERS.banners();
        break;
      default:
        storageFolder = PUBLIC_FOLDERS.cms();
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await uploadPublicFile(buffer, storageFolder, file.name, file.type);
    const url = getPublicUrl(key);

    return apiResponse({ key, url }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
