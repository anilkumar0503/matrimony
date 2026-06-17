import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL;

function getConnection() {
  if (!redisUrl) return null;
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || "6379"),
      password: url.password || undefined,
      tls: url.protocol === "rediss:" ? {} : undefined,
    };
  } catch {
    return null;
  }
}

export async function enqueueImageProcessing(imageId: string) {
  const connection = getConnection();
  if (!connection) return;
  try {
    const queue = new Queue("image-processing", { connection });
    await queue.add(
      "process-image",
      { imageId },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      }
    );
    await queue.close();
  } catch {
    // Redis unavailable, skip queuing
  }
}

export async function enqueueNotification(payload: {
  userId: string;
  event: string;
  variables?: Record<string, string>;
  channels?: string[];
}) {
  const connection = getConnection();
  if (!connection) return;
  try {
    const queue = new Queue("notifications", { connection });
    await queue.add("send-notification", payload, {
      attempts: 3,
      backoff: { type: "fixed", delay: 2000 },
    });
    await queue.close();
  } catch {
    // Redis unavailable, skip queuing
  }
}
