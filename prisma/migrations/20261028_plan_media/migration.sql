-- CreateTable
CREATE TABLE "PlanMedia" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "nutritionPlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanMedia_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlanMedia_exactly_one_plan" CHECK (num_nonnulls("workoutPlanId", "nutritionPlanId") = 1)
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanMedia_uploadId_key" ON "PlanMedia"("uploadId");

-- CreateIndex
CREATE INDEX "PlanMedia_workoutPlanId_idx" ON "PlanMedia"("workoutPlanId");

-- CreateIndex
CREATE INDEX "PlanMedia_nutritionPlanId_idx" ON "PlanMedia"("nutritionPlanId");

-- AddForeignKey
ALTER TABLE "PlanMedia" ADD CONSTRAINT "PlanMedia_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMedia" ADD CONSTRAINT "PlanMedia_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMedia" ADD CONSTRAINT "PlanMedia_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
