/*
  Warnings:

  - You are about to drop the column `downloadCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `likeCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `downloadCount` on the `versions` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `versions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `versions` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `versions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "versions_resourceId_status_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "downloadCount",
DROP COLUMN "favoriteCount",
DROP COLUMN "likeCount",
DROP COLUMN "viewCount",
ADD COLUMN     "downloadsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "favoritesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "versions" DROP COLUMN "downloadCount",
DROP COLUMN "fileSize",
DROP COLUMN "status",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "changelog" DROP NOT NULL;
