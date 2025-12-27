-- CreateEnum
CREATE TYPE "ShowcaseCategory" AS ENUM ('THREE_D_MODEL', 'TEXTURE', 'MAP', 'PLUGIN', 'CONCEPT_ART', 'ANIMATION', 'MUSIC_SOUND', 'OTHER');

-- CreateEnum
CREATE TYPE "ShowcasePostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShowcaseMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "showcase_posts" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" "ShowcaseCategory" NOT NULL,
    "status" "ShowcasePostStatus" NOT NULL DEFAULT 'DRAFT',
    "thumbnailUrl" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "linkedResourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "showcase_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcase_post_media" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "type" "ShowcaseMediaType" NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "showcase_post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcase_post_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "showcase_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcase_post_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "showcase_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "showcase_posts_authorId_idx" ON "showcase_posts"("authorId");

-- CreateIndex
CREATE INDEX "showcase_posts_category_idx" ON "showcase_posts"("category");

-- CreateIndex
CREATE INDEX "showcase_posts_status_idx" ON "showcase_posts"("status");

-- CreateIndex
CREATE INDEX "showcase_posts_featured_idx" ON "showcase_posts"("featured");

-- CreateIndex
CREATE INDEX "showcase_posts_createdAt_idx" ON "showcase_posts"("createdAt");

-- CreateIndex
CREATE INDEX "showcase_post_media_postId_order_idx" ON "showcase_post_media"("postId", "order");

-- CreateIndex
CREATE INDEX "showcase_post_likes_userId_idx" ON "showcase_post_likes"("userId");

-- CreateIndex
CREATE INDEX "showcase_post_likes_postId_idx" ON "showcase_post_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "showcase_post_likes_userId_postId_key" ON "showcase_post_likes"("userId", "postId");

-- CreateIndex
CREATE INDEX "showcase_post_comments_postId_createdAt_idx" ON "showcase_post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "showcase_post_comments_userId_idx" ON "showcase_post_comments"("userId");

-- AddForeignKey
ALTER TABLE "showcase_posts" ADD CONSTRAINT "showcase_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_posts" ADD CONSTRAINT "showcase_posts_linkedResourceId_fkey" FOREIGN KEY ("linkedResourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_post_media" ADD CONSTRAINT "showcase_post_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "showcase_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_post_likes" ADD CONSTRAINT "showcase_post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_post_likes" ADD CONSTRAINT "showcase_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "showcase_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_post_comments" ADD CONSTRAINT "showcase_post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showcase_post_comments" ADD CONSTRAINT "showcase_post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "showcase_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
