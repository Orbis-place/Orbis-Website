/*
  Warnings:

  - You are about to rename the column `name` to `slug` on the `teams` table.
  - You are about to rename the column `displayName` to `name` on the `teams` table.

*/

-- Rename columns to match naming convention of Resource and Server models
-- name (slug) -> slug
-- displayName (display name) -> name

-- Step 1: Rename 'name' to 'slug'
ALTER TABLE "teams" RENAME COLUMN "name" TO "slug";

-- Step 2: Rename 'displayName' to 'name'
ALTER TABLE "teams" RENAME COLUMN "displayName" TO "name";
