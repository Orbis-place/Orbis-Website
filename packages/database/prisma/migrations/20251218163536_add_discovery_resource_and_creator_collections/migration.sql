/*
  Warnings:

  - You are about to drop the `discovery_collection_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discovery_collections` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscoveryResourceCollectionType" AS ENUM ('SELECTION_OF_WEEK', 'HIDDEN_GEMS', 'STARTER_PACK', 'THEME_OF_MONTH');

-- CreateEnum
CREATE TYPE "DiscoveryCreatorCollectionType" AS ENUM ('FEATURED_CREATOR', 'HALL_OF_FAME', 'TRENDING_WEEK', 'TOP_BY_CATEGORY', 'NEW_CREATORS');

-- DropForeignKey
ALTER TABLE "discovery_collection_items" DROP CONSTRAINT "discovery_collection_items_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "discovery_collection_items" DROP CONSTRAINT "discovery_collection_items_resourceId_fkey";

-- DropTable
DROP TABLE "discovery_collection_items";

-- DropTable
DROP TABLE "discovery_collections";

-- DropEnum
DROP TYPE "DiscoveryCollectionType";

-- CreateTable
CREATE TABLE "discovery_resource_collections" (
    "id" TEXT NOT NULL,
    "type" "DiscoveryResourceCollectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_resource_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_resource_collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_resource_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_creator_collections" (
    "id" TEXT NOT NULL,
    "type" "DiscoveryCreatorCollectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_creator_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_creator_collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_creator_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discovery_resource_collections_type_key" ON "discovery_resource_collections"("type");

-- CreateIndex
CREATE INDEX "discovery_resource_collection_items_collectionId_order_idx" ON "discovery_resource_collection_items"("collectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_resource_collection_items_collectionId_resourceId_key" ON "discovery_resource_collection_items"("collectionId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_creator_collections_type_key" ON "discovery_creator_collections"("type");

-- CreateIndex
CREATE INDEX "discovery_creator_collection_items_collectionId_order_idx" ON "discovery_creator_collection_items"("collectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_creator_collection_items_collectionId_userId_key" ON "discovery_creator_collection_items"("collectionId", "userId");

-- AddForeignKey
ALTER TABLE "discovery_resource_collection_items" ADD CONSTRAINT "discovery_resource_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "discovery_resource_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_resource_collection_items" ADD CONSTRAINT "discovery_resource_collection_items_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_creator_collection_items" ADD CONSTRAINT "discovery_creator_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "discovery_creator_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_creator_collection_items" ADD CONSTRAINT "discovery_creator_collection_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
