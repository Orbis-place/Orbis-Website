/*
  Warnings:

  - You are about to drop the column `downloadCount` on the `resource_version_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "resource_version_files" DROP COLUMN "downloadCount";

-- AlterTable
ALTER TABLE "resource_versions" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0;
