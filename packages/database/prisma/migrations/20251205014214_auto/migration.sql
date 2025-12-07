/*
  Warnings:

  - You are about to drop the column `parentId` on the `resource_categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resource_categories" DROP CONSTRAINT "resource_categories_parentId_fkey";

-- DropIndex
DROP INDEX "resource_categories_parentId_idx";

-- AlterTable
ALTER TABLE "resource_categories" DROP COLUMN "parentId";
