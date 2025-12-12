/*
  Warnings:

  - You are about to drop the column `discordUrl` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokUrl` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `servers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "servers" DROP COLUMN "discordUrl",
DROP COLUMN "tiktokUrl",
DROP COLUMN "twitterUrl",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "country" TEXT;

-- CreateTable
CREATE TABLE "server_social_links" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "type" "SocialLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "server_social_links_serverId_idx" ON "server_social_links"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "server_social_links_serverId_type_key" ON "server_social_links"("serverId", "type");

-- AddForeignKey
ALTER TABLE "server_social_links" ADD CONSTRAINT "server_social_links_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
