-- AlterTable
ALTER TABLE "showcase_post_comments" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "showcase_post_comments_parentId_idx" ON "showcase_post_comments"("parentId");

-- AddForeignKey
ALTER TABLE "showcase_post_comments" ADD CONSTRAINT "showcase_post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "showcase_post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
