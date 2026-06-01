import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  } as ConstructorParameters<typeof PrismaClient>[0]);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
