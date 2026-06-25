-- CreateTable
CREATE TABLE "GalleryAccess" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "grantedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryAccess_ownerId_idx" ON "GalleryAccess"("ownerId");

-- CreateIndex
CREATE INDEX "GalleryAccess_grantedToId_idx" ON "GalleryAccess"("grantedToId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAccess_ownerId_grantedToId_key" ON "GalleryAccess"("ownerId", "grantedToId");

-- AddForeignKey
ALTER TABLE "GalleryAccess" ADD CONSTRAINT "GalleryAccess_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAccess" ADD CONSTRAINT "GalleryAccess_grantedToId_fkey" FOREIGN KEY ("grantedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
