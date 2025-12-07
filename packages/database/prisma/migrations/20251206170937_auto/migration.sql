/*
  Warnings:

  - You are about to drop the `resource_version_compatible_versions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "resource_version_compatible_versions" DROP CONSTRAINT "resource_version_compatible_versions_versionId_fkey";

-- AlterTable
ALTER TABLE "resource_categories" ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "resource_version_compatible_versions";

-- CreateTable
CREATE TABLE "resource_category_usage_by_type" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_category_usage_by_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hytale_versions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "hytaleVersion" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hytale_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_categoryId_idx" ON "resource_category_usage_by_type"("categoryId");

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_resourceType_idx" ON "resource_category_usage_by_type"("resourceType");

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_usageCount_idx" ON "resource_category_usage_by_type"("usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "resource_category_usage_by_type_categoryId_resourceType_key" ON "resource_category_usage_by_type"("categoryId", "resourceType");

-- CreateIndex
CREATE INDEX "hytale_versions_versionId_idx" ON "hytale_versions"("versionId");

-- CreateIndex
CREATE INDEX "hytale_versions_hytaleVersion_idx" ON "hytale_versions"("hytaleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "hytale_versions_versionId_hytaleVersion_key" ON "hytale_versions"("versionId", "hytaleVersion");

-- CreateIndex
CREATE INDEX "resource_categories_usageCount_idx" ON "resource_categories"("usageCount");

-- AddForeignKey
ALTER TABLE "resource_category_usage_by_type" ADD CONSTRAINT "resource_category_usage_by_type_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hytale_versions" ADD CONSTRAINT "hytale_versions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
