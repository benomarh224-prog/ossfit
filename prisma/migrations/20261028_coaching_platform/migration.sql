-- AlterTable
ALTER TABLE "SiteContent" ALTER COLUMN "brandName" SET DEFAULT 'COACH OUSSAMA',
ALTER COLUMN "coachName" SET DEFAULT 'Oussama',
ALTER COLUMN "coachCity" SET DEFAULT 'Morocco',
ALTER COLUMN "whatsappNumber" SET DEFAULT '+212610296995',
ALTER COLUMN "coachPortrait" SET DEFAULT '/images/service-coaching.jpg',
ALTER COLUMN "heroTitle" SET DEFAULT 'YOUR GOAL. YOUR PLAN. YOUR PROGRESS.',
ALTER COLUMN "heroSubtitle" SET DEFAULT 'Build a stronger routine with Coach Oussama. Personal training, practical nutrition guidance and a private space to track every step — wherever you train.',
ALTER COLUMN "aboutStory" SET DEFAULT 'Your training should fit your life. We start with your goals, experience and available equipment, then build a practical plan around you. Your private dashboard keeps your workouts, check-ins and coach conversations together.';

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSetup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachSetup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_pathname_key" ON "UploadedFile"("pathname");

-- CreateIndex
CREATE INDEX "UploadedFile_ownerId_createdAt_idx" ON "UploadedFile"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- Keep orphaned plans as reusable templates before adding their user relation.
UPDATE "WorkoutPlan" SET "userId" = NULL WHERE "userId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "User" WHERE "User"."id" = "WorkoutPlan"."userId");
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
UPDATE "NutritionPlan" SET "userId" = NULL WHERE "userId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "User" WHERE "User"."id" = "NutritionPlan"."userId");
ALTER TABLE "NutritionPlan" ADD CONSTRAINT "NutritionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
