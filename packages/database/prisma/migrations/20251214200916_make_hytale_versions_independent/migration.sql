/*
  Warnings:

  - You are about to drop the column `addedAt` on the `hytale_versions` table. All the data in the column will be lost.
  - You are about to drop the column `versionId` on the `hytale_versions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hytaleVersion]` on the table `hytale_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "hytale_versions" DROP CONSTRAINT "hytale_versions_versionId_fkey";

-- DropIndex
DROP INDEX "hytale_versions_versionId_hytaleVersion_key";

-- DropIndex
DROP INDEX "hytale_versions_versionId_idx";

-- AlterTable
ALTER TABLE "hytale_versions" DROP COLUMN "addedAt",
DROP COLUMN "versionId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "resource_version_to_hytale_versions" (
    "id" TEXT NOT NULL,
    "resourceVersionId" TEXT NOT NULL,
    "hytaleVersionId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_version_to_hytale_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_version_to_hytale_versions_resourceVersionId_idx" ON "resource_version_to_hytale_versions"("resourceVersionId");

-- CreateIndex
CREATE INDEX "resource_version_to_hytale_versions_hytaleVersionId_idx" ON "resource_version_to_hytale_versions"("hytaleVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_version_to_hytale_versions_resourceVersionId_hytal_key" ON "resource_version_to_hytale_versions"("resourceVersionId", "hytaleVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "hytale_versions_hytaleVersion_key" ON "hytale_versions"("hytaleVersion");

-- AddForeignKey
ALTER TABLE "resource_version_to_hytale_versions" ADD CONSTRAINT "resource_version_to_hytale_versions_resourceVersionId_fkey" FOREIGN KEY ("resourceVersionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_to_hytale_versions" ADD CONSTRAINT "resource_version_to_hytale_versions_hytaleVersionId_fkey" FOREIGN KEY ("hytaleVersionId") REFERENCES "hytale_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
