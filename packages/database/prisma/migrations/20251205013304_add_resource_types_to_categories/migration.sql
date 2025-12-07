-- AlterTable
ALTER TABLE "resource_categories" ADD COLUMN     "resourceTypes" "ResourceType"[] DEFAULT ARRAY[]::"ResourceType"[];
