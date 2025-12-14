/*
  Warnings:

  - A unique constraint covering the columns `[resourceId,type]` on the table `resource_external_links` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `resource_external_links` table with a default value.

*/
-- AlterTable
-- Add columns with defaults for existing rows
ALTER TABLE "resource_external_links" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "resource_external_links_order_idx" ON "resource_external_links"("order");

-- CreateIndex
CREATE UNIQUE INDEX "resource_external_links_resourceId_type_key" ON "resource_external_links"("resourceId", "type");
