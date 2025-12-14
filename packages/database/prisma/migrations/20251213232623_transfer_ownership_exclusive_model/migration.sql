/*
  Warnings:

  - You are about to drop the column `ownerId` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `servers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_teamId_fkey";

-- DropForeignKey
ALTER TABLE "servers" DROP CONSTRAINT "servers_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "servers" DROP CONSTRAINT "servers_teamId_fkey";

-- DropIndex
DROP INDEX "resources_ownerId_idx";

-- DropIndex
DROP INDEX "resources_teamId_idx";

-- DropIndex
DROP INDEX "servers_ownerId_idx";

-- DropIndex
DROP INDEX "servers_teamId_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "ownerId",
DROP COLUMN "teamId",
ADD COLUMN     "ownerTeamId" TEXT,
ADD COLUMN     "ownerUserId" TEXT;

-- AlterTable
ALTER TABLE "servers" DROP COLUMN "ownerId",
DROP COLUMN "teamId",
ADD COLUMN     "ownerTeamId" TEXT,
ADD COLUMN     "ownerUserId" TEXT;

-- CreateIndex
CREATE INDEX "resources_ownerUserId_idx" ON "resources"("ownerUserId");

-- CreateIndex
CREATE INDEX "resources_ownerTeamId_idx" ON "resources"("ownerTeamId");

-- CreateIndex
CREATE INDEX "servers_ownerUserId_idx" ON "servers"("ownerUserId");

-- CreateIndex
CREATE INDEX "servers_ownerTeamId_idx" ON "servers"("ownerTeamId");

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
