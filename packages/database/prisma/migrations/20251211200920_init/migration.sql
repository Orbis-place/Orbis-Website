-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "ServerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "TeamInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'REUPLOADED_WORK', 'INAPPROPRIATE', 'MALICIOUS', 'NAME_SQUATTING', 'POOR_DESCRIPTION', 'INVALID_METADATA', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportResourceType" AS ENUM ('USER');

-- CreateEnum
CREATE TYPE "SocialLinkType" AS ENUM ('TWITTER', 'GITHUB', 'DISCORD', 'YOUTUBE', 'TWITCH', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'REDDIT', 'TIKTOK', 'CUSTOM');

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
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "banner" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "banReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "bannedBy" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "language" TEXT NOT NULL DEFAULT 'en',
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_social_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SocialLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_invitations" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "TeamInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_social_links" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "type" "SocialLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDesc" VARCHAR(200),
    "serverAddress" TEXT NOT NULL,
    "status" "ServerStatus" NOT NULL DEFAULT 'PENDING',
    "logo" TEXT,
    "banner" TEXT,
    "gameVersion" TEXT NOT NULL,
    "supportedVersions" TEXT[],
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "maxPlayers" INTEGER NOT NULL DEFAULT 100,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastPing" TIMESTAMP(3),
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "websiteUrl" TEXT,
    "discordUrl" TEXT,
    "youtubeUrl" TEXT,
    "twitterUrl" TEXT,
    "tiktokUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "ownerId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#69a024',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_tag_relations" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "server_tag_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT DEFAULT '#69a024',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_category_relations" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "server_category_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_status_history" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "oldStatus" "ServerStatus",
    "newStatus" "ServerStatus" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,

    CONSTRAINT "server_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_player_history" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPlayers" INTEGER NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "pingMs" INTEGER,

    CONSTRAINT "server_player_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceType" "ReportResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reporterId" TEXT NOT NULL,
    "handledBy" TEXT,
    "handledAt" TIMESTAMP(3),
    "response" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT DEFAULT '#69a024',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedBy" TEXT,
    "reason" TEXT,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" VARCHAR(200) NOT NULL,
    "description" TEXT,
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
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
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
    "title" TEXT,
    "description" TEXT,
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
    "hash" TEXT NOT NULL,
    "alt" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'TEMPORARY',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "movedAt" TIMESTAMP(3),

    CONSTRAINT "resource_description_images_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "resource_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "resourceTypes" "ResourceType"[] DEFAULT ARRAY[]::"ResourceType"[],
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
CREATE TABLE "resource_category_usage_by_type" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_category_usage_by_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
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

    CONSTRAINT "resource_to_tags_pkey" PRIMARY KEY ("resourceId","tagId")
);

-- CreateTable
CREATE TABLE "resource_tag_usage_by_type" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_tag_usage_by_type_pkey" PRIMARY KEY ("id")
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
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hytale_versions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "hytaleVersion" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hytale_versions_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "follows_followerId_idx" ON "follows"("followerId");

-- CreateIndex
CREATE INDEX "follows_followingId_idx" ON "follows"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "user_social_links_userId_idx" ON "user_social_links"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_social_links_userId_type_key" ON "user_social_links"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE INDEX "teams_ownerId_idx" ON "teams"("ownerId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "team_invitations_teamId_idx" ON "team_invitations"("teamId");

-- CreateIndex
CREATE INDEX "team_invitations_inviterId_idx" ON "team_invitations"("inviterId");

-- CreateIndex
CREATE INDEX "team_invitations_inviteeId_idx" ON "team_invitations"("inviteeId");

-- CreateIndex
CREATE INDEX "team_invitations_status_idx" ON "team_invitations"("status");

-- CreateIndex
CREATE INDEX "team_invitations_expiresAt_idx" ON "team_invitations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "team_invitations_teamId_inviteeId_status_key" ON "team_invitations"("teamId", "inviteeId", "status");

-- CreateIndex
CREATE INDEX "team_social_links_teamId_idx" ON "team_social_links"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_social_links_teamId_type_key" ON "team_social_links"("teamId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "servers_slug_key" ON "servers"("slug");

-- CreateIndex
CREATE INDEX "servers_slug_idx" ON "servers"("slug");

-- CreateIndex
CREATE INDEX "servers_status_idx" ON "servers"("status");

-- CreateIndex
CREATE INDEX "servers_ownerId_idx" ON "servers"("ownerId");

-- CreateIndex
CREATE INDEX "servers_teamId_idx" ON "servers"("teamId");

-- CreateIndex
CREATE INDEX "servers_featured_idx" ON "servers"("featured");

-- CreateIndex
CREATE INDEX "servers_voteCount_idx" ON "servers"("voteCount");

-- CreateIndex
CREATE INDEX "servers_createdAt_idx" ON "servers"("createdAt");

-- CreateIndex
CREATE INDEX "servers_isOnline_idx" ON "servers"("isOnline");

-- CreateIndex
CREATE UNIQUE INDEX "server_tags_name_key" ON "server_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "server_tags_slug_key" ON "server_tags"("slug");

-- CreateIndex
CREATE INDEX "server_tag_relations_serverId_idx" ON "server_tag_relations"("serverId");

-- CreateIndex
CREATE INDEX "server_tag_relations_tagId_idx" ON "server_tag_relations"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "server_tag_relations_serverId_tagId_key" ON "server_tag_relations"("serverId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "server_categories_name_key" ON "server_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "server_categories_slug_key" ON "server_categories"("slug");

-- CreateIndex
CREATE INDEX "server_category_relations_serverId_idx" ON "server_category_relations"("serverId");

-- CreateIndex
CREATE INDEX "server_category_relations_categoryId_idx" ON "server_category_relations"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "server_category_relations_serverId_categoryId_key" ON "server_category_relations"("serverId", "categoryId");

-- CreateIndex
CREATE INDEX "server_status_history_serverId_idx" ON "server_status_history"("serverId");

-- CreateIndex
CREATE INDEX "server_status_history_changedAt_idx" ON "server_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "server_player_history_serverId_timestamp_idx" ON "server_player_history"("serverId", "timestamp");

-- CreateIndex
CREATE INDEX "server_player_history_timestamp_idx" ON "server_player_history"("timestamp");

-- CreateIndex
CREATE INDEX "reports_resourceType_resourceId_idx" ON "reports"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");

-- CreateIndex
CREATE INDEX "badges_slug_idx" ON "badges"("slug");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_awardedAt_idx" ON "user_badges"("awardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

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
CREATE INDEX "resource_description_images_uploadedBy_hash_idx" ON "resource_description_images"("uploadedBy", "hash");

-- CreateIndex
CREATE INDEX "resource_external_links_resourceId_idx" ON "resource_external_links"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_name_key" ON "resource_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_slug_key" ON "resource_categories"("slug");

-- CreateIndex
CREATE INDEX "resource_categories_order_idx" ON "resource_categories"("order");

-- CreateIndex
CREATE INDEX "resource_categories_usageCount_idx" ON "resource_categories"("usageCount");

-- CreateIndex
CREATE INDEX "resource_to_categories_categoryId_idx" ON "resource_to_categories"("categoryId");

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_categoryId_idx" ON "resource_category_usage_by_type"("categoryId");

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_resourceType_idx" ON "resource_category_usage_by_type"("resourceType");

-- CreateIndex
CREATE INDEX "resource_category_usage_by_type_usageCount_idx" ON "resource_category_usage_by_type"("usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "resource_category_usage_by_type_categoryId_resourceType_key" ON "resource_category_usage_by_type"("categoryId", "resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tags_name_key" ON "resource_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tags_slug_key" ON "resource_tags"("slug");

-- CreateIndex
CREATE INDEX "resource_tags_usageCount_idx" ON "resource_tags"("usageCount");

-- CreateIndex
CREATE INDEX "resource_to_tags_tagId_idx" ON "resource_to_tags"("tagId");

-- CreateIndex
CREATE INDEX "resource_tag_usage_by_type_tagId_idx" ON "resource_tag_usage_by_type"("tagId");

-- CreateIndex
CREATE INDEX "resource_tag_usage_by_type_resourceType_idx" ON "resource_tag_usage_by_type"("resourceType");

-- CreateIndex
CREATE INDEX "resource_tag_usage_by_type_usageCount_idx" ON "resource_tag_usage_by_type"("usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tag_usage_by_type_tagId_resourceType_key" ON "resource_tag_usage_by_type"("tagId", "resourceType");

-- CreateIndex
CREATE INDEX "resource_versions_resourceId_channel_idx" ON "resource_versions"("resourceId", "channel");

-- CreateIndex
CREATE INDEX "resource_versions_publishedAt_idx" ON "resource_versions"("publishedAt");

-- CreateIndex
CREATE INDEX "resource_versions_resourceId_status_idx" ON "resource_versions"("resourceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "resource_versions_resourceId_versionNumber_key" ON "resource_versions"("resourceId", "versionNumber");

-- CreateIndex
CREATE INDEX "hytale_versions_versionId_idx" ON "hytale_versions"("versionId");

-- CreateIndex
CREATE INDEX "hytale_versions_hytaleVersion_idx" ON "hytale_versions"("hytaleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "hytale_versions_versionId_hytaleVersion_key" ON "hytale_versions"("versionId", "hytaleVersion");

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
CREATE INDEX "resource_status_history_resourceId_idx" ON "resource_status_history"("resourceId");

-- CreateIndex
CREATE INDEX "resource_status_history_changedAt_idx" ON "resource_status_history"("changedAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_social_links" ADD CONSTRAINT "user_social_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_social_links" ADD CONSTRAINT "team_social_links_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_tag_relations" ADD CONSTRAINT "server_tag_relations_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_tag_relations" ADD CONSTRAINT "server_tag_relations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "server_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_category_relations" ADD CONSTRAINT "server_category_relations_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_category_relations" ADD CONSTRAINT "server_category_relations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "server_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_status_history" ADD CONSTRAINT "server_status_history_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_status_history" ADD CONSTRAINT "server_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_player_history" ADD CONSTRAINT "server_player_history_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "resource_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "resource_external_links" ADD CONSTRAINT "resource_external_links_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_categories" ADD CONSTRAINT "resource_to_categories_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_categories" ADD CONSTRAINT "resource_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_category_usage_by_type" ADD CONSTRAINT "resource_category_usage_by_type_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_tags" ADD CONSTRAINT "resource_to_tags_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_to_tags" ADD CONSTRAINT "resource_to_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "resource_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tag_usage_by_type" ADD CONSTRAINT "resource_tag_usage_by_type_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "resource_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_primaryFileId_fkey" FOREIGN KEY ("primaryFileId") REFERENCES "resource_version_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hytale_versions" ADD CONSTRAINT "hytale_versions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "resource_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "resource_status_history" ADD CONSTRAINT "resource_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_status_history" ADD CONSTRAINT "resource_status_history_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
