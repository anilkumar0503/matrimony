-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ProfileReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileReport_reporterId_reportedUserId_key" ON "ProfileReport"("reporterId", "reportedUserId");

-- AddForeignKey
ALTER TABLE "ProfileReport" ADD CONSTRAINT "ProfileReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileReport" ADD CONSTRAINT "ProfileReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
