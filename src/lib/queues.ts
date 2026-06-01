import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const imageProcessingQueue = new Queue("image-processing", { connection });

export async function enqueueImageProcessing(imageId: string) {
  await imageProcessingQueue.add(
    "process-image",
    { imageId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    }
  );
}

export async function enqueueNotification(payload: {
  userId: string;
  event: string;
  variables?: Record<string, string>;
  channels?: string[];
}) {
  const notifQueue = new Queue("notifications", { connection });
  await notifQueue.add("send-notification", payload, {
    attempts: 3,
    backoff: { type: "fixed", delay: 2000 },
  });
  await notifQueue.close();
}
