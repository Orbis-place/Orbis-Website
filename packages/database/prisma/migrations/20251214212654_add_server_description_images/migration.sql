-- CreateTable
CREATE TABLE "server_description_images" (
    "id" TEXT NOT NULL,
    "serverId" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "alt" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'TEMPORARY',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "movedAt" TIMESTAMP(3),

    CONSTRAINT "server_description_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "server_description_images_serverId_idx" ON "server_description_images"("serverId");

-- CreateIndex
CREATE INDEX "server_description_images_status_expiresAt_idx" ON "server_description_images"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "server_description_images_uploadedBy_idx" ON "server_description_images"("uploadedBy");

-- CreateIndex
CREATE INDEX "server_description_images_status_idx" ON "server_description_images"("status");

-- CreateIndex
CREATE INDEX "server_description_images_uploadedBy_hash_idx" ON "server_description_images"("uploadedBy", "hash");

-- AddForeignKey
ALTER TABLE "server_description_images" ADD CONSTRAINT "server_description_images_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_description_images" ADD CONSTRAINT "server_description_images_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
