-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PLUGIN', 'ASSET_PACK', 'MOD', 'MODPACK', 'PREMADE_SERVER', 'WORLD', 'PREFAB', 'DATA_PACK');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ResourceVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FREE', 'PAID', 'DONATION');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('MIT', 'APACHE_2_0', 'GPL_3_0', 'LGPL_3_0', 'BSD_3_CLAUSE', 'BSD_2_CLAUSE', 'MPL_2_0', 'CC_BY_4_0', 'CC_BY_SA_4_0', 'CC_BY_NC_4_0', 'CC_BY_NC_SA_4_0', 'CC_BY_ND_4_0', 'CC_BY_NC_ND_4_0', 'CC0_1_0', 'ALL_RIGHTS_RESERVED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('TEMPORARY', 'PERMANENT', 'ORPHANED');

-- CreateEnum
CREATE TYPE "ExternalLinkType" AS ENUM ('ISSUE_TRACKER', 'SOURCE_CODE', 'WIKI', 'DISCORD', 'DONATION', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReleaseChannel" AS ENUM ('RELEASE', 'BETA', 'ALPHA', 'SNAPSHOT');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('JAR', 'ZIP', 'SCHEMATIC', 'JSON', 'OTHER');

-- CreateEnum
CREATE TYPE "DependencyType" AS ENUM ('REQUIRED', 'OPTIONAL', 'INCOMPATIBLE');

-- CreateTable
CREATE TABLE "Resource" (
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

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceGalleryImage" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDescriptionImage" (
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

    CONSTRAINT "ResourceDescriptionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalLink" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "type" "ExternalLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "ExternalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceCategory" (
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

    CONSTRAINT "ResourceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceToCategory" (
    "resourceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceToCategory_pkey" PRIMARY KEY ("resourceId","categoryId")
);

-- CreateTable
CREATE TABLE "ResourceTag" (
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

    CONSTRAINT "ResourceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceToTag" (
    "resourceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResourceToTag_pkey" PRIMARY KEY ("resourceId","tagId")
);

-- CreateTable
CREATE TABLE "Version" (
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

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionCompatibleVersion" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "hytaleVersion" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersionCompatibleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionChangelogImage" (
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

    CONSTRAINT "VersionChangelogImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionFile" (
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

    CONSTRAINT "VersionFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionDependency" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "dependencyId" TEXT NOT NULL,
    "dependencyType" "DependencyType" NOT NULL,
    "versionRequirement" TEXT,

    CONSTRAINT "VersionDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "versionId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceStatusHistory" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fromStatus" "ResourceStatus" NOT NULL,
    "toStatus" "ResourceStatus" NOT NULL,
    "reason" TEXT,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE INDEX "Resource_ownerId_idx" ON "Resource"("ownerId");

-- CreateIndex
CREATE INDEX "Resource_teamId_idx" ON "Resource"("teamId");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "Resource_status_idx" ON "Resource"("status");

-- CreateIndex
CREATE INDEX "Resource_visibility_idx" ON "Resource"("visibility");

-- CreateIndex
CREATE INDEX "Resource_featured_idx" ON "Resource"("featured");

-- CreateIndex
CREATE INDEX "Resource_publishedAt_idx" ON "Resource"("publishedAt");

-- CreateIndex
CREATE INDEX "Resource_lastActivityAt_idx" ON "Resource"("lastActivityAt");

-- CreateIndex
CREATE INDEX "Resource_slug_idx" ON "Resource"("slug");

-- CreateIndex
CREATE INDEX "ResourceGalleryImage_resourceId_idx" ON "ResourceGalleryImage"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceGalleryImage_order_idx" ON "ResourceGalleryImage"("order");

-- CreateIndex
CREATE INDEX "ResourceDescriptionImage_resourceId_idx" ON "ResourceDescriptionImage"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceDescriptionImage_status_expiresAt_idx" ON "ResourceDescriptionImage"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ResourceDescriptionImage_uploadedBy_idx" ON "ResourceDescriptionImage"("uploadedBy");

-- CreateIndex
CREATE INDEX "ResourceDescriptionImage_status_idx" ON "ResourceDescriptionImage"("status");

-- CreateIndex
CREATE INDEX "ExternalLink_resourceId_idx" ON "ExternalLink"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_name_key" ON "ResourceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_slug_key" ON "ResourceCategory"("slug");

-- CreateIndex
CREATE INDEX "ResourceCategory_parentId_idx" ON "ResourceCategory"("parentId");

-- CreateIndex
CREATE INDEX "ResourceCategory_order_idx" ON "ResourceCategory"("order");

-- CreateIndex
CREATE INDEX "ResourceToCategory_categoryId_idx" ON "ResourceToCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTag_name_key" ON "ResourceTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTag_slug_key" ON "ResourceTag"("slug");

-- CreateIndex
CREATE INDEX "ResourceTag_categoryId_idx" ON "ResourceTag"("categoryId");

-- CreateIndex
CREATE INDEX "ResourceTag_usageCount_idx" ON "ResourceTag"("usageCount");

-- CreateIndex
CREATE INDEX "ResourceToTag_tagId_idx" ON "ResourceToTag"("tagId");

-- CreateIndex
CREATE INDEX "Version_resourceId_channel_idx" ON "Version"("resourceId", "channel");

-- CreateIndex
CREATE INDEX "Version_publishedAt_idx" ON "Version"("publishedAt");

-- CreateIndex
CREATE INDEX "Version_resourceId_status_idx" ON "Version"("resourceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Version_resourceId_versionNumber_key" ON "Version"("resourceId", "versionNumber");

-- CreateIndex
CREATE INDEX "VersionCompatibleVersion_versionId_idx" ON "VersionCompatibleVersion"("versionId");

-- CreateIndex
CREATE INDEX "VersionCompatibleVersion_hytaleVersion_idx" ON "VersionCompatibleVersion"("hytaleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "VersionCompatibleVersion_versionId_hytaleVersion_key" ON "VersionCompatibleVersion"("versionId", "hytaleVersion");

-- CreateIndex
CREATE INDEX "VersionChangelogImage_versionId_idx" ON "VersionChangelogImage"("versionId");

-- CreateIndex
CREATE INDEX "VersionChangelogImage_status_expiresAt_idx" ON "VersionChangelogImage"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "VersionChangelogImage_uploadedBy_idx" ON "VersionChangelogImage"("uploadedBy");

-- CreateIndex
CREATE INDEX "VersionChangelogImage_status_idx" ON "VersionChangelogImage"("status");

-- CreateIndex
CREATE INDEX "VersionFile_versionId_idx" ON "VersionFile"("versionId");

-- CreateIndex
CREATE INDEX "VersionDependency_dependencyId_idx" ON "VersionDependency"("dependencyId");

-- CreateIndex
CREATE UNIQUE INDEX "VersionDependency_versionId_dependencyId_key" ON "VersionDependency"("versionId", "dependencyId");

-- CreateIndex
CREATE INDEX "Contributor_userId_idx" ON "Contributor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_resourceId_userId_key" ON "Contributor"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_resourceId_idx" ON "Like"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_resourceId_key" ON "Like"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_resourceId_idx" ON "Favorite"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_resourceId_key" ON "Favorite"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "Download_resourceId_idx" ON "Download"("resourceId");

-- CreateIndex
CREATE INDEX "Download_userId_idx" ON "Download"("userId");

-- CreateIndex
CREATE INDEX "Download_downloadedAt_idx" ON "Download"("downloadedAt");

-- CreateIndex
CREATE INDEX "ResourceStatusHistory_resourceId_idx" ON "ResourceStatusHistory"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceStatusHistory_changedAt_idx" ON "ResourceStatusHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceGalleryImage" ADD CONSTRAINT "ResourceGalleryImage_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDescriptionImage" ADD CONSTRAINT "ResourceDescriptionImage_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDescriptionImage" ADD CONSTRAINT "ResourceDescriptionImage_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLink" ADD CONSTRAINT "ExternalLink_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceCategory" ADD CONSTRAINT "ResourceCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ResourceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceToCategory" ADD CONSTRAINT "ResourceToCategory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceToCategory" ADD CONSTRAINT "ResourceToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResourceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTag" ADD CONSTRAINT "ResourceTag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResourceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceToTag" ADD CONSTRAINT "ResourceToTag_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceToTag" ADD CONSTRAINT "ResourceToTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ResourceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_primaryFileId_fkey" FOREIGN KEY ("primaryFileId") REFERENCES "VersionFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionCompatibleVersion" ADD CONSTRAINT "VersionCompatibleVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChangelogImage" ADD CONSTRAINT "VersionChangelogImage_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChangelogImage" ADD CONSTRAINT "VersionChangelogImage_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionFile" ADD CONSTRAINT "VersionFile_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionDependency" ADD CONSTRAINT "VersionDependency_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionDependency" ADD CONSTRAINT "VersionDependency_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceStatusHistory" ADD CONSTRAINT "ResourceStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceStatusHistory" ADD CONSTRAINT "ResourceStatusHistory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
