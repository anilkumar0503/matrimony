import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const STORAGE_ENABLED = process.env.STORAGE_ENABLED !== "false";
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || "./public/uploads";

export const s3Client = STORAGE_ENABLED ? new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true,
}) : null;

const BUCKET = process.env.STORAGE_BUCKET || "matrimony-uploads";

// Derive public CDN base URL from endpoint + bucket
// e.g. https://ap-south-1.linodeobjects.com → https://matrimony-uploads.ap-south-1.linodeobjects.com
function buildPublicCdnBase(): string {
  const endpoint = process.env.STORAGE_ENDPOINT || "";
  const cdnOverride = process.env.STORAGE_PUBLIC_CDN_URL;
  if (cdnOverride) return cdnOverride;
  // Convert path-style endpoint to virtual-hosted CDN URL
  const match = endpoint.match(/^(https?:\/\/)(.+)$/);
  if (match) return `${match[1]}${BUCKET}.${match[2]}`;
  return `${endpoint}/${BUCKET}`;
}

const PUBLIC_CDN_BASE = buildPublicCdnBase();

// Private folders — all user-owned sensitive content
export const PRIVATE_FOLDERS = {
  profile:   (userId: string) => `users/${userId}/profile`,
  gallery:   (userId: string) => `users/${userId}/gallery`,
  kyc:       (userId: string) => `users/${userId}/kyc`,
  horoscope: (userId: string) => `users/${userId}/horoscope`,
  invoices:  () => `invoices`,
  exports:   () => `exports`,
} as const;

// Public folders — CMS, blog images, testimonials
export const PUBLIC_FOLDERS = {
  cms:          () => `public/cms`,
  testimonials: () => `public/testimonials`,
  banners:      () => `public/banners`,
} as const;

// Legacy alias for backward compatibility
export const STORAGE_FOLDERS = PRIVATE_FOLDERS;

async function ensureLocalDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

async function putToS3(
  buffer: Buffer,
  key: string,
  mimeType: string,
  acl: "private" | "public-read"
): Promise<void> {
  await s3Client!.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: acl,
    })
  );
}

// Upload as PRIVATE — use getSignedDownloadUrl() to serve
export async function uploadPrivateFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "bin";
  const key = `${folder}/${uuidv4()}.${ext}`;

  if (STORAGE_ENABLED && s3Client) {
    await putToS3(buffer, key, mimeType, "private");
  } else {
    const localPath = path.join(LOCAL_STORAGE_PATH, key);
    await ensureLocalDir(path.dirname(localPath));
    await writeFile(localPath, buffer);
  }

  return key;
}

// Upload as PUBLIC — use getPublicUrl() to serve
export async function uploadPublicFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "bin";
  const key = `${folder}/${uuidv4()}.${ext}`;

  if (STORAGE_ENABLED && s3Client) {
    await putToS3(buffer, key, mimeType, "public-read");
  } else {
    const localPath = path.join(LOCAL_STORAGE_PATH, key);
    await ensureLocalDir(path.dirname(localPath));
    await writeFile(localPath, buffer);
  }

  return key;
}

// Backward-compatible alias (defaults to private)
export const uploadFile = uploadPrivateFile;

export async function deleteFile(key: string): Promise<void> {
  if (STORAGE_ENABLED && s3Client) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } else {
    const localPath = path.join(LOCAL_STORAGE_PATH, key);
    if (existsSync(localPath)) {
      await unlink(localPath);
    }
  }
}

// Generate a temporary signed URL for a PRIVATE file (default 1 hour)
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (STORAGE_ENABLED && s3Client) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn });
  } else {
    return `/uploads/${key}`;
  }
}

// Get permanent public URL for a PUBLIC file
export function getPublicUrl(key: string): string {
  if (STORAGE_ENABLED) {
    return `${PUBLIC_CDN_BASE}/${key}`;
  } else {
    return `/uploads/${key}`;
  }
}

// Determine if a key belongs to a private folder
export function isPrivateKey(key: string): boolean {
  return key.startsWith("users/") || key.startsWith("invoices/") || key.startsWith("exports/");
}

// Resolve any stored key to a servable URL
// Private keys get a 1-hour signed URL; public keys get a permanent CDN URL
export async function resolveFileUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!key) return "";
  if (!STORAGE_ENABLED) return `/uploads/${key}`;
  if (key.startsWith("http")) return key; // already a full URL
  return isPrivateKey(key)
    ? getSignedDownloadUrl(key, expiresIn)
    : getPublicUrl(key);
}

export const IMAGE_LIMITS = {
  maxSizeMb: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  minDimension: 400,
};
