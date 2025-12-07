/*
  Warnings:

  - You are about to drop the column `downloadsCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `favoritesCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `viewsCount` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `votesCount` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the `contributors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `downloads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `external_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `version_changelog_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `version_compatible_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `version_dependencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `version_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `versions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contributors" DROP CONSTRAINT "contributors_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "contributors" DROP CONSTRAINT "contributors_userId_fkey";

-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_userId_fkey";

-- DropForeignKey
ALTER TABLE "external_links" DROP CONSTRAINT "external_links_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_latestVersionId_fkey";

-- DropForeignKey
ALTER TABLE "version_changelog_images" DROP CONSTRAINT "version_changelog_images_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "version_changelog_images" DROP CONSTRAINT "version_changelog_images_versionId_fkey";

-- DropForeignKey
ALTER TABLE "version_compatible_versions" DROP CONSTRAINT "version_compatible_versions_versionId_fkey";

-- DropForeignKey
ALTER TABLE "version_dependencies" DROP CONSTRAINT "version_dependencies_dependencyId_fkey";

-- DropForeignKey
ALTER TABLE "version_dependencies" DROP CONSTRAINT "version_dependencies_versionId_fkey";

-- DropForeignKey
ALTER TABLE "version_files" DROP CONSTRAINT "version_files_versionId_fkey";

-- DropForeignKey
ALTER TABLE "versions" DROP CONSTRAINT "versions_primaryFileId_fkey";

-- DropForeignKey
ALTER TABLE "versions" DROP CONSTRAINT "versions_resourceId_fkey";

-- DropIndex
DROP INDEX "servers_votesCount_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "downloadsCount",
DROP COLUMN "favoritesCount",
DROP COLUMN "likesCount",
DROP COLUMN "viewsCount",
ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "servers" DROP COLUMN "votesCount",
ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "contributors";

-- DropTable
DROP TABLE "downloads";

-- DropTable
DROP TABLE "external_links";

-- DropTable
DROP TABLE "favorites";

-- DropTable
DROP TABLE "likes";

-- DropTable
DROP TABLE "version_changelog_images";

-- DropTable
DROP TABLE "version_compatible_versions";

-- DropTable
DROP TABLE "version_dependencies";

-- DropTable
DROP TABLE "version_files";

-- DropTable
DROP TABLE "versions";

-- CreateTable
CREATE TABLE "resource_external_links" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "type" "ExternalLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "resource_external_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_versions" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "name" TEXT,
    "channel" "ReleaseChannel" NOT NULL DEFAULT 'RELEASE',
    "changelog" TEXT,
    "primaryFileId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_compatible_versions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "hytaleVersion" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_version_compatible_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_changelog_images" (
    "id" TEXT NOT NULL,
    "versionId" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "alt" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'TEMPORARY',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "movedAt" TIMESTAMP(3),

    CONSTRAINT "resource_version_changelog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_files" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "displayName" TEXT,
    "fileType" "FileType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_version_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_dependencies" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "dependencyId" TEXT NOT NULL,
    "dependencyType" "DependencyType" NOT NULL,
    "versionRequirement" TEXT,

    CONSTRAINT "resource_version_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_contributors" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_downloads" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "versionId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_external_links_resourceId_idx" ON "resource_external_links"("resourceId");

-- CreateIndex
CREATE INDEX "resource_versions_resourceId_channel_idx" ON "resource_versions"("resourceId", "channel");

-- CreateIndex
CREATE INDEX "resource_versions_publishedAt_idx" ON "resource_versions"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "resource_versions_resourceId_versionNumber_key" ON "resource_versions"("resourceId", "versionNumber");

-- CreateIndex
CREATE INDEX "resource_version_compatible_versions_versionId_idx" ON "resource_version_compatible_versions"("versionId");

-- CreateIndex
CREATE INDEX "resource_version_compatible_versions_hytaleVersion_idx" ON "resource_version_compatible_versions"("hytaleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "resource_version_compatible_versions_versionId_hytaleVersio_key" ON "resource_version_compatible_versions"("versionId", "hytaleVersion");

-- CreateIndex
CREATE INDEX "resource_version_changelog_images_versionId_idx" ON "resource_version_changelog_images"("versionId");

-- CreateIndex
CREATE INDEX "resource_version_changelog_images_status_expiresAt_idx" ON "resource_version_changelog_images"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "resource_version_changelog_images_uploadedBy_idx" ON "resource_version_changelog_images"("uploadedBy");

-- CreateIndex
CREATE INDEX "resource_version_changelog_images_status_idx" ON "resource_version_changelog_images"("status");

-- CreateIndex
CREATE INDEX "resource_version_changelog_images_uploadedBy_hash_idx" ON "resource_version_changelog_images"("uploadedBy", "hash");

-- CreateIndex
CREATE INDEX "resource_version_files_versionId_idx" ON "resource_version_files"("versionId");

-- CreateIndex
CREATE INDEX "resource_version_dependencies_dependencyId_idx" ON "resource_version_dependencies"("dependencyId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_version_dependencies_versionId_dependencyId_key" ON "resource_version_dependencies"("versionId", "dependencyId");

-- CreateIndex
CREATE INDEX "resource_contributors_userId_idx" ON "resource_contributors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_contributors_resourceId_userId_key" ON "resource_contributors"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "resource_likes_userId_idx" ON "resource_likes"("userId");

-- CreateIndex
CREATE INDEX "resource_likes_resourceId_idx" ON "resource_likes"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_likes_userId_resourceId_key" ON "resource_likes"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "resource_favorites_userId_idx" ON "resource_favorites"("userId");

-- CreateIndex
CREATE INDEX "resource_favorites_resourceId_idx" ON "resource_favorites"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_favorites_userId_resourceId_key" ON "resource_favorites"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "resource_downloads_resourceId_idx" ON "resource_downloads"("resourceId");

-- CreateIndex
CREATE INDEX "resource_downloads_userId_idx" ON "resource_downloads"("userId");

-- CreateIndex
CREATE INDEX "resource_downloads_downloadedAt_idx" ON "resource_downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "servers_voteCount_idx" ON "servers"("voteCount");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "resource_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_external_links" ADD CONSTRAINT "resource_external_links_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_primaryFileId_fkey" FOREIGN KEY ("primaryFileId") REFERENCES "resource_version_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_compatible_versions" ADD CONSTRAINT "resource_version_compatible_versions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_changelog_images" ADD CONSTRAINT "resource_version_changelog_images_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_changelog_images" ADD CONSTRAINT "resource_version_changelog_images_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_files" ADD CONSTRAINT "resource_version_files_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_dependencies" ADD CONSTRAINT "resource_version_dependencies_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_dependencies" ADD CONSTRAINT "resource_version_dependencies_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributors" ADD CONSTRAINT "resource_contributors_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributors" ADD CONSTRAINT "resource_contributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_likes" ADD CONSTRAINT "resource_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_likes" ADD CONSTRAINT "resource_likes_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_favorites" ADD CONSTRAINT "resource_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_favorites" ADD CONSTRAINT "resource_favorites_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
