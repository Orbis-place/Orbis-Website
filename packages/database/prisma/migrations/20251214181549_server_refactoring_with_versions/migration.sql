/*
  Warnings:

  - You are about to drop the column `banner` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `gameVersion` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `supportedVersions` on the `servers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "resource_external_links" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "servers" DROP COLUMN "banner",
DROP COLUMN "gameVersion",
DROP COLUMN "logo",
DROP COLUMN "supportedVersions",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "gameVersionId" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "server_supported_versions" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "hytaleVersionId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_supported_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "server_supported_versions_serverId_idx" ON "server_supported_versions"("serverId");

-- CreateIndex
CREATE INDEX "server_supported_versions_hytaleVersionId_idx" ON "server_supported_versions"("hytaleVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "server_supported_versions_serverId_hytaleVersionId_key" ON "server_supported_versions"("serverId", "hytaleVersionId");

-- CreateIndex
CREATE INDEX "servers_country_idx" ON "servers"("country");

-- CreateIndex
CREATE INDEX "servers_gameVersionId_idx" ON "servers"("gameVersionId");

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_gameVersionId_fkey" FOREIGN KEY ("gameVersionId") REFERENCES "hytale_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_supported_versions" ADD CONSTRAINT "server_supported_versions_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_supported_versions" ADD CONSTRAINT "server_supported_versions_hytaleVersionId_fkey" FOREIGN KEY ("hytaleVersionId") REFERENCES "hytale_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
