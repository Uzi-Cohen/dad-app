-- Fashion Content Studio Database Setup for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rvduopsutnondsnvxruf/sql

-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'EDITOR');
CREATE TYPE "WatermarkPosition" AS ENUM ('TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED');
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "AssetRole" AS ENUM ('HERO', 'DETAIL', 'OUTPUT', 'REFERENCE');
CREATE TYPE "AIProvider" AS ENUM ('REPLICATE', 'RUNWAY', 'FAL_PIKA', 'FAL_LUMA');
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Create tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "watermarkPosition" "WatermarkPosition" NOT NULL DEFAULT 'BOTTOM_RIGHT',
    "watermarkOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "defaultPrompt" TEXT NOT NULL DEFAULT 'High-end fashion product video of a dress, realistic fabric texture preserved, subtle cinematic camera push-in, soft studio lighting, clean background, elegant boutique look, sharp stitching, natural folds, no distortion.',
    "negativePrompt" TEXT NOT NULL DEFAULT 'no extra limbs, no distorted fabric, no warped patterns, no blurry details, no watermarks',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "fabric" TEXT,
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_brandId_sku_key" UNIQUE ("brandId", "sku")
);

CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "role" "AssetRole" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL,
    "model" TEXT,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "parameters" JSONB,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "outputAssetId" TEXT UNIQUE,
    "error" TEXT,
    "providerJobId" TEXT,
    "duration" INTEGER,
    "cost" DOUBLE PRECISION,
    "aspectRatio" TEXT NOT NULL DEFAULT '9:16',
    "videoDuration" INTEGER NOT NULL DEFAULT 6,
    "template" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "GenerationJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GenerationJob_outputAssetId_fkey" FOREIGN KEY ("outputAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create many-to-many relationship table for GenerationJob input assets
CREATE TABLE "_GenerationInputAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GenerationInputAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GenerationInputAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "GenerationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "Brand_userId_idx" ON "Brand"("userId");
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Asset_productId_idx" ON "Asset"("productId");
CREATE INDEX "Asset_type_idx" ON "Asset"("type");
CREATE INDEX "Asset_role_idx" ON "Asset"("role");
CREATE INDEX "GenerationJob_productId_idx" ON "GenerationJob"("productId");
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");
CREATE INDEX "GenerationJob_provider_idx" ON "GenerationJob"("provider");
CREATE INDEX "GenerationJob_createdAt_idx" ON "GenerationJob"("createdAt");
CREATE UNIQUE INDEX "_GenerationInputAssets_AB_unique" ON "_GenerationInputAssets"("A", "B");
CREATE INDEX "_GenerationInputAssets_B_index" ON "_GenerationInputAssets"("B");

-- Create default admin user (password: admin123, hashed with bcrypt)
INSERT INTO "User" ("id", "email", "password", "name", "role")
VALUES (
    gen_random_uuid()::text,
    'admin@fashion-studio.local',
    '$2a$10$rMdXQvJlN7fYCW3qLKp/LuVlZxqJ1Y0yxLqJYkO9.Y/8ZkrG9MYKe',
    'Admin User',
    'ADMIN'
);

-- Create default owner user (password: fashion123, hashed with bcrypt)
INSERT INTO "User" ("id", "email", "password", "name", "role")
VALUES (
    gen_random_uuid()::text,
    'owner@fashion-studio.local',
    '$2a$10$7Z5VhLZXK/qp4K5k8N1L4.2bfN6yqZ9VnJ7Y7mZ/X5Y8wK9rZ5MNy',
    'Fashion Owner',
    'OWNER'
);

-- Create default brand for the owner user
INSERT INTO "Brand" ("id", "userId", "name", "watermarkPosition", "watermarkOpacity", "defaultPrompt", "negativePrompt")
SELECT
    gen_random_uuid()::text,
    "id",
    'Fashion House',
    'BOTTOM_RIGHT',
    0.7,
    'High-end fashion product video of a dress, realistic fabric texture preserved, subtle cinematic camera push-in, soft studio lighting, clean background, elegant boutique look, sharp stitching, natural folds, no distortion.',
    'no extra limbs, no distorted fabric, no warped patterns, no blurry details, no watermarks, no text'
FROM "User"
WHERE "email" = 'owner@fashion-studio.local';

-- Success message
SELECT 'Database setup complete!' as message;
