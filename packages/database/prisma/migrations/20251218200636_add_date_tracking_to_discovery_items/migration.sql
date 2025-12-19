/*
  Warnings:

  - You are about to drop the `discovery_creator_collection_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discovery_creator_collections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "discovery_creator_collection_items" DROP CONSTRAINT "discovery_creator_collection_items_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "discovery_creator_collection_items" DROP CONSTRAINT "discovery_creator_collection_items_userId_fkey";

-- AlterTable
ALTER TABLE "discovery_resource_collection_items" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "discovery_creator_collection_items";

-- DropTable
DROP TABLE "discovery_creator_collections";

-- DropEnum
DROP TYPE "DiscoveryCreatorCollectionType";

-- CreateIndex
CREATE INDEX "discovery_resource_collection_items_collectionId_endDate_idx" ON "discovery_resource_collection_items"("collectionId", "endDate");
