-- AlterTable
ALTER TABLE "resource_versions" ADD COLUMN     "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "resource_versions_resourceId_status_idx" ON "resource_versions"("resourceId", "status");
