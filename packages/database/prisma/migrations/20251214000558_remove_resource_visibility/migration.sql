/*
  Warnings:

  - You are about to drop the column `visibility` on the `resources` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "resources_visibility_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "visibility";

-- DropEnum
DROP TYPE "ResourceVisibility";
