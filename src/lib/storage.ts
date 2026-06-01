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

const s3 = STORAGE_ENABLED ? new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true,
}) : null;

const BUCKET = process.env.STORAGE_BUCKET || "matrimony-uploads";

export const STORAGE_FOLDERS = {
  profile: (userId: string) => `users/${userId}/profile`,
  gallery: (userId: string) => `users/${userId}/gallery`,
  kyc: (userId: string) => `users/${userId}/kyc`,
  horoscope: (userId: string) => `users/${userId}/horoscope`,
  invoices: () => `invoices`,
  exports: () => `exports`,
} as const;

async function ensureLocalDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "bin";
  const key = `${folder}/${uuidv4()}.${ext}`;

  if (STORAGE_ENABLED && s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  } else {
    // Local storage fallback
    const localPath = path.join(LOCAL_STORAGE_PATH, key);
    await ensureLocalDir(path.dirname(localPath));
    await writeFile(localPath, buffer);
  }

  return key;
}

export async function deleteFile(key: string): Promise<void> {
  if (STORAGE_ENABLED && s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } else {
    // Local storage fallback
    const localPath = path.join(LOCAL_STORAGE_PATH, key);
    if (existsSync(localPath)) {
      await unlink(localPath);
    }
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (STORAGE_ENABLED && s3) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn });
  } else {
    // Local storage - return direct URL
    return `/uploads/${key}`;
  }
}

export function getPublicUrl(key: string): string {
  if (STORAGE_ENABLED) {
    return `${process.env.STORAGE_ENDPOINT}/${BUCKET}/${key}`;
  } else {
    // Local storage
    return `/uploads/${key}`;
  }
}

export const IMAGE_LIMITS = {
  maxSizeMb: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  minDimension: 400,
};
