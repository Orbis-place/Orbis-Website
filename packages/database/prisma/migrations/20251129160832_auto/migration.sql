/*
  Warnings:

  - You are about to drop the `Contributor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Download` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExternalLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceDescriptionImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceGalleryImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceToCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VersionChangelogImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VersionCompatibleVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VersionDependency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VersionFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contributor" DROP CONSTRAINT "Contributor_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Contributor" DROP CONSTRAINT "Contributor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalLink" DROP CONSTRAINT "ExternalLink_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_latestVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_moderatedById_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_teamId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceCategory" DROP CONSTRAINT "ResourceCategory_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceDescriptionImage" DROP CONSTRAINT "ResourceDescriptionImage_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceDescriptionImage" DROP CONSTRAINT "ResourceDescriptionImage_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "ResourceGalleryImage" DROP CONSTRAINT "ResourceGalleryImage_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceStatusHistory" DROP CONSTRAINT "ResourceStatusHistory_changedById_fkey";

-- DropForeignKey
ALTER TABLE "ResourceStatusHistory" DROP CONSTRAINT "ResourceStatusHistory_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceTag" DROP CONSTRAINT "ResourceTag_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceToCategory" DROP CONSTRAINT "ResourceToCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceToCategory" DROP CONSTRAINT "ResourceToCategory_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceToTag" DROP CONSTRAINT "ResourceToTag_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceToTag" DROP CONSTRAINT "ResourceToTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_primaryFileId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "VersionChangelogImage" DROP CONSTRAINT "VersionChangelogImage_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "VersionChangelogImage" DROP CONSTRAINT "VersionChangelogImage_versionId_fkey";

-- DropForeignKey
ALTER TABLE "VersionCompatibleVersion" DROP CONSTRAINT "VersionCompatibleVersion_versionId_fkey";

-- DropForeignKey
ALTER TABLE "VersionDependency" DROP CONSTRAINT "VersionDependency_dependencyId_fkey";

-- DropForeignKey
ALTER TABLE "VersionDependency" DROP CONSTRAINT "VersionDependency_versionId_fkey";

-- DropForeignKey
ALTER TABLE "VersionFile" DROP CONSTRAINT "VersionFile_versionId_fkey";

-- DropTable
DROP TABLE "Contributor";

-- DropTable
DROP TABLE "Download";

-- DropTable
DROP TABLE "ExternalLink";

-- DropTable
DROP TABLE "Favorite";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "Resource";

-- DropTable
DROP TABLE "ResourceCategory";

-- DropTable
DROP TABLE "ResourceDescriptionImage";

-- DropTable
DROP TABLE "ResourceGalleryImage";

-- DropTable
DROP TABLE "ResourceStatusHistory";

-- DropTable
DROP TABLE "ResourceTag";

-- DropTable
DROP TABLE "ResourceToCategory";

-- DropTable
DROP TABLE "ResourceToTag";

-- DropTable
DROP TABLE "Version";

-- DropTable
DROP TABLE "VersionChangelogImage";

-- DropTable
DROP TABLE "VersionCompatibleVersion";

-- DropTable
DROP TABLE "VersionDependency";

-- DropTable
DROP TABLE "VersionFile";

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "ResourceVisibility" NOT NULL DEFAULT 'PUBLIC',
    "iconUrl" TEXT,
    "bannerUrl" TEXT,
    "latestVersionId" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'FREE',
    "price" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "licenseType" "LicenseType" NOT NULL,
    "customLicenseName" TEXT,
    "licenseSpdxId" TEXT,
    "licenseUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "staffPick" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "teamId" TEXT,
    "moderationNotes" TEXT,
    "rejectionReason" TEXT,
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_gallery_images" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_description_images" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'TEMPORARY',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "movedAt" TIMESTAMP(3),

    CONSTRAINT "resource_description_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_links" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "type" "ExternalLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "external_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_to_categories" (
    "resourceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_to_categories_pkey" PRIMARY KEY ("resourceId","categoryId")
);

-- CreateTable
CREATE TABLE "resource_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "categoryId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_to_tags" (
    "resourceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "resource_to_tags_pkey" PRIMARY KEY ("resourceId","tagId")
);

-- CreateTable
CREATE TABLE "versions" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "name" TEXT,
    "channel" "ReleaseChannel" NOT NULL DEFAULT 'RELEASE',
    "changelog" TEXT NOT NULL,
    "primaryFileId" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "status" "VersionStatus" NOT NULL DEFAULT 'APPROVED',
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_compatible_versions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "hytaleVersion" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "version_compatible_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_changelog_images" (
    "id" TEXT NOT NULL,
    "versionId" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'TEMPORARY',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "movedAt" TIMESTAMP(3),

    CONSTRAINT "version_changelog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_files" (
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

    CONSTRAINT "version_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_dependencies" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "dependencyId" TEXT NOT NULL,
    "dependencyType" "DependencyType" NOT NULL,
    "versionRequirement" TEXT,

    CONSTRAINT "version_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributors" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "versionId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_status_history" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fromStatus" "ResourceStatus" NOT NULL,
    "toStatus" "ResourceStatus" NOT NULL,
    "reason" TEXT,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resources_slug_key" ON "resources"("slug");

-- CreateIndex
CREATE INDEX "resources_ownerId_idx" ON "resources"("ownerId");

-- CreateIndex
CREATE INDEX "resources_teamId_idx" ON "resources"("teamId");

-- CreateIndex
CREATE INDEX "resources_type_idx" ON "resources"("type");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "resources_visibility_idx" ON "resources"("visibility");

-- CreateIndex
CREATE INDEX "resources_featured_idx" ON "resources"("featured");

-- CreateIndex
CREATE INDEX "resources_publishedAt_idx" ON "resources"("publishedAt");

-- CreateIndex
CREATE INDEX "resources_lastActivityAt_idx" ON "resources"("lastActivityAt");

-- CreateIndex
CREATE INDEX "resources_slug_idx" ON "resources"("slug");

-- CreateIndex
CREATE INDEX "resource_gallery_images_resourceId_idx" ON "resource_gallery_images"("resourceId");

-- CreateIndex
CREATE INDEX "resource_gallery_images_order_idx" ON "resource_gallery_images"("order");

-- CreateIndex
CREATE INDEX "resource_description_images_resourceId_idx" ON "resource_description_images"("resourceId");

-- CreateIndex
CREATE INDEX "resource_description_images_status_expiresAt_idx" ON "resource_description_images"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "resource_description_images_uploadedBy_idx" ON "resource_description_images"("uploadedBy");

-- CreateIndex
CREATE INDEX "resource_description_images_status_idx" ON "resource_description_images"("status");

-- CreateIndex
CREATE INDEX "external_links_resourceId_idx" ON "external_links"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_name_key" ON "resource_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_slug_key" ON "resource_categories"("slug");

-- CreateIndex
CREATE INDEX "resource_categories_parentId_idx" ON "resource_categories"("parentId");

-- CreateIndex
CREATE INDEX "resource_categories_order_idx" ON "resource_categories"("order");

-- CreateIndex
CREATE INDEX "resource_to_categories_categoryId_idx" ON "resource_to_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tags_name_key" ON "resource_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tags_slug_key" ON "resource_tags"("slug");

-- CreateIndex
CREATE INDEX "resource_tags_categoryId_idx" ON "resource_tags"("categoryId");

-- CreateIndex
CREATE INDEX "resource_tags_usageCount_idx" ON "resource_tags"("usageCount");

-- CreateIndex
CREATE INDEX "resource_to_tags_tagId_idx" ON "resource_to_tags"("tagId");

-- CreateIndex
CREATE INDEX "versions_resourceId_channel_idx" ON "versions"("resourceId", "channel");

-- CreateIndex
CREATE INDEX "versions_publishedAt_idx" ON "versions"("publishedAt");

-- CreateIndex
CREATE INDEX "versions_resourceId_status_idx" ON "versions"("resourceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "versions_resourceId_versionNumber_key" ON "versions"("resourceId", "versionNumber");

-- CreateIndex
CREATE INDEX "version_compatible_versions_versionId_idx" ON "version_compatible_versions"("versionId");

-- CreateIndex
CREATE INDEX "version_compatible_versions_hytaleVersion_idx" ON "version_compatible_versions"("hytaleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "version_compatible_versions_versionId_hytaleVersion_key" ON "version_compatible_versions"("versionId", "hytaleVersion");

-- CreateIndex
CREATE INDEX "version_changelog_images_versionId_idx" ON "version_changelog_images"("versionId");

-- CreateIndex
CREATE INDEX "version_changelog_images_status_expiresAt_idx" ON "version_changelog_images"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "version_changelog_images_uploadedBy_idx" ON "version_changelog_images"("uploadedBy");

-- CreateIndex
CREATE INDEX "version_changelog_images_status_idx" ON "version_changelog_images"("status");

-- CreateIndex
CREATE INDEX "version_files_versionId_idx" ON "version_files"("versionId");

-- CreateIndex
CREATE INDEX "version_dependencies_dependencyId_idx" ON "version_dependencies"("dependencyId");

-- CreateIndex
CREATE UNIQUE INDEX "version_dependencies_versionId_dependencyId_key" ON "version_dependencies"("versionId", "dependencyId");

-- CreateIndex
CREATE INDEX "contributors_userId_idx" ON "contributors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "contributors_resourceId_userId_key" ON "contributors"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "likes_userId_idx" ON "likes"("userId");

-- CreateIndex
CREATE INDEX "likes_resourceId_idx" ON "likes"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_resourceId_key" ON "likes"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_resourceId_idx" ON "favorites"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_resourceId_key" ON "favorites"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "downloads_resourceId_idx" ON "downloads"("resourceId");

-- CreateIndex
CREATE INDEX "downloads_userId_idx" ON "downloads"("userId");

-- CreateIndex
CREATE INDEX "downloads_downloadedAt_idx" ON "downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "resource_status_history_resourceId_idx" ON "resource_status_history"("resourceId");

-- CreateIndex
CREATE INDEX "resource_status_history_changedAt_idx" ON "resource_status_history"("changedAt");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_gallery_images" ADD CONSTRAINT "resource_gallery_images_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_description_images" ADD CONSTRAINT "resource_description_images_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_description_images" ADD CONSTRAINT "resource_description_images_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_links" ADD CONSTRAINT "external_links_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_categories" ADD CONSTRAINT "resource_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "resource_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_categories" ADD CONSTRAINT "resource_to_categories_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_categories" ADD CONSTRAINT "resource_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_tags" ADD CONSTRAINT "resource_to_tags_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_tags" ADD CONSTRAINT "resource_to_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "resource_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_primaryFileId_fkey" FOREIGN KEY ("primaryFileId") REFERENCES "version_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_compatible_versions" ADD CONSTRAINT "version_compatible_versions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_changelog_images" ADD CONSTRAINT "version_changelog_images_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_changelog_images" ADD CONSTRAINT "version_changelog_images_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_files" ADD CONSTRAINT "version_files_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_dependencies" ADD CONSTRAINT "version_dependencies_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_dependencies" ADD CONSTRAINT "version_dependencies_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_status_history" ADD CONSTRAINT "resource_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_status_history" ADD CONSTRAINT "resource_status_history_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
