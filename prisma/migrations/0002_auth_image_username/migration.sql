-- AlterTable
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT gen_random_uuid()::text;
