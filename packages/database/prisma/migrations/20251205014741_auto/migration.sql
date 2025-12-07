/*
  Warnings:

  - You are about to drop the column `categoryId` on the `resource_tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resource_tags" DROP CONSTRAINT "resource_tags_categoryId_fkey";

-- DropIndex
DROP INDEX "resource_tags_categoryId_idx";

-- AlterTable
ALTER TABLE "resource_tags" DROP COLUMN "categoryId";
