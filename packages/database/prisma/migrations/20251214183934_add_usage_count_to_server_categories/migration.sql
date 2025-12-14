-- AlterTable
ALTER TABLE "server_categories" ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "server_categories_usageCount_idx" ON "server_categories"("usageCount");
