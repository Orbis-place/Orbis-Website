-- CreateEnum
CREATE TYPE "DiscoveryCollectionType" AS ENUM ('SELECTION_OF_WEEK', 'HIDDEN_GEMS', 'STARTER_PACK', 'THEME_OF_MONTH');

-- CreateTable
CREATE TABLE "discovery_collections" (
    "id" TEXT NOT NULL,
    "type" "DiscoveryCollectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discovery_collections_type_key" ON "discovery_collections"("type");

-- CreateIndex
CREATE INDEX "discovery_collection_items_collectionId_order_idx" ON "discovery_collection_items"("collectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_collection_items_collectionId_resourceId_key" ON "discovery_collection_items"("collectionId", "resourceId");

-- AddForeignKey
ALTER TABLE "discovery_collection_items" ADD CONSTRAINT "discovery_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "discovery_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_collection_items" ADD CONSTRAINT "discovery_collection_items_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
