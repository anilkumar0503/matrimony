import { Worker, Job } from "bullmq";
import sharp from "sharp";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import prisma from "@/lib/prisma";
import { getSetting, getSettingOrDefault, SETTINGS_KEYS } from "@/lib/platform-settings";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
};

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.STORAGE_BUCKET || "matrimony-uploads";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c: Buffer) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function downloadFromS3(key: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return streamToBuffer(response.Body as Readable);
}

async function uploadToS3(buffer: Buffer, key: string, mimeType: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: buffer, ContentType: mimeType, ACL: "private",
  }));
}

async function processImage(job: Job) {
  const { imageId } = job.data;

  const image = await prisma.profileImage.findUnique({ where: { id: imageId } });
  if (!image) { console.error(`Image ${imageId} not found`); return; }

  try {
    const buffer = await downloadFromS3(image.originalUrl);

    const watermarkEnabled = await getSetting(SETTINGS_KEYS.IMAGE_WATERMARK_ENABLED) === "true";
    const watermarkText = await getSettingOrDefault(SETTINGS_KEYS.IMAGE_WATERMARK_TEXT, "Jasmine Matrimony");

    let pipeline = sharp(buffer)
      .resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 });

    if (watermarkEnabled) {
      const svgWatermark = Buffer.from(`
        <svg width="400" height="60">
          <text x="10" y="40" font-family="sans-serif" font-size="24"
            fill="white" opacity="0.4" transform="rotate(-20, 200, 30)">
            ${watermarkText}
          </text>
        </svg>
      `);
      pipeline = (sharp(await pipeline.toBuffer()) as sharp.Sharp)
        .composite([{ input: svgWatermark, gravity: "southeast", blend: "over" }])
        .webp({ quality: 85 });
    }

    const processedBuffer = await pipeline.toBuffer();

    const watermarkedKey = image.originalUrl.replace(/\.[^.]+$/, "") + "-watermarked.webp";
    await uploadToS3(processedBuffer, watermarkedKey, "image/webp");

    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: 300, height: 400, fit: "cover" })
      .webp({ quality: 70 })
      .toBuffer();

    const thumbnailKey = image.originalUrl.replace(/\.[^.]+$/, "") + "-thumb.webp";
    await uploadToS3(thumbnailBuffer, thumbnailKey, "image/webp");

    await prisma.profileImage.update({
      where: { id: imageId },
      data: { watermarkedUrl: watermarkedKey, thumbnailUrl: thumbnailKey },
    });

    console.log(`✓ Processed image ${imageId}`);
  } catch (err) {
    console.error(`✗ Error processing image ${imageId}:`, err);
    console.error(`Processing failed for image ${imageId}`);
    throw err;
  }
}

export function startImageWorker() {
  const worker = new Worker("image-processing", processImage, { connection, concurrency: 3 });

  worker.on("completed", (job) => console.log(`Image job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`Image job ${job?.id} failed:`, err.message));

  console.log("🖼  Image processing worker started");
  return worker;
}
