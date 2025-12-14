-- AlterTable
ALTER TABLE "server_tags" ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "server_tags_usageCount_idx" ON "server_tags"("usageCount");
