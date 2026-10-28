import { z } from "zod";
import type { Prisma } from "@prisma/client";

const shortText = z.string().trim().max(200);
const notes = z.string().trim().max(8000);
const exercise = z.object({
  name: z.string().trim().min(1).max(200),
  sets: shortText.optional(), reps: shortText.optional(), rest: shortText.optional(),
});
const workoutFields = z.object({
  title: z.string().trim().min(2).max(200), goal: shortText.nullable().optional(),
  summary: notes.nullable().optional(), active: z.boolean(),
  days: z.array(z.object({ name: z.string().trim().min(1).max(100), focus: shortText.optional(), exercises: z.array(exercise).max(60) })).max(31),
});
const amount = z.number().int().nonnegative().max(100000).nullable().optional();
const nutritionFields = z.object({
  title: z.string().trim().min(2).max(200), active: z.boolean(),
  dailyCalories: amount, proteinG: amount, carbsG: amount, fatsG: amount,
  waterCupsGoal: z.number().int().min(1).max(100), notes: notes.nullable().optional(),
  meals: z.array(z.object({ name: z.string().trim().min(1).max(100), suggestion: notes.optional() })).max(50),
});
const version = z.string().datetime();
export const workoutEditSchema = workoutFields.extend({ expectedUpdatedAt: version }).strict();
export const nutritionEditSchema = nutritionFields.extend({ expectedUpdatedAt: version }).strict();
export const workoutCreateSchema = workoutFields.extend({ userId: z.string().min(1), active: z.boolean().default(true) }).strict();
export const nutritionCreateSchema = nutritionFields.extend({ userId: z.string().min(1), active: z.boolean().default(true), waterCupsGoal: z.number().int().min(1).max(100).default(8) }).strict();

export class PlanEditError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

// All creates and edits lock the same client row before selecting the active plan.
export async function lockPlanClient(tx: Prisma.TransactionClient, userId: string) {
  const users = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "User" WHERE "id" = ${userId} AND "role" = 'CLIENT' FOR UPDATE`;
  if (!users.length) throw new PlanEditError(400, "This trainee is no longer available. Refresh the client list.");
}

async function currentPlan(tx: Prisma.TransactionClient, kind: "workout" | "nutrition", id: string, expected: string) {
  const plan = kind === "workout" ? await tx.workoutPlan.findUnique({ where: { id } }) : await tx.nutritionPlan.findUnique({ where: { id } });
  if (!plan) throw new PlanEditError(404, "Plan not found");
  if (plan.updatedAt.getTime() !== new Date(expected).getTime()) throw new PlanEditError(409, "This plan changed while you were editing it. Close the editor and reopen it to load the latest version.");
  if (plan.userId) await lockPlanClient(tx, plan.userId);
  return plan;
}

export async function editWorkoutPlan(tx: Prisma.TransactionClient, id: string, data: z.infer<typeof workoutEditSchema>) {
  const current = await currentPlan(tx, "workout", id, data.expectedUpdatedAt);
  const changed = await tx.workoutPlan.updateMany({ where: { id, updatedAt: new Date(data.expectedUpdatedAt) }, data: {
    title: data.title, goal: data.goal ?? null, summary: data.summary ?? null,
    active: data.active, daysJson: JSON.stringify(data.days),
  } });
  if (!changed.count) throw new PlanEditError(409, "This plan changed. Close the editor and reopen it before saving.");
  if (current.userId) {
    if (data.active) await tx.workoutPlan.updateMany({ where: { userId: current.userId, active: true, id: { not: id } }, data: { active: false } });
    await tx.notification.create({ data: { userId: current.userId, title: "Workout plan updated", body: data.title, type: "workout" } });
  }
  return tx.workoutPlan.findUniqueOrThrow({ where: { id } });
}

export async function editNutritionPlan(tx: Prisma.TransactionClient, id: string, data: z.infer<typeof nutritionEditSchema>) {
  const current = await currentPlan(tx, "nutrition", id, data.expectedUpdatedAt);
  const changed = await tx.nutritionPlan.updateMany({ where: { id, updatedAt: new Date(data.expectedUpdatedAt) }, data: {
    title: data.title, dailyCalories: data.dailyCalories ?? null, proteinG: data.proteinG ?? null,
    carbsG: data.carbsG ?? null, fatsG: data.fatsG ?? null, waterCupsGoal: data.waterCupsGoal,
    active: data.active, notes: data.notes ?? null, mealsJson: JSON.stringify(data.meals),
  } });
  if (!changed.count) throw new PlanEditError(409, "This plan changed. Close the editor and reopen it before saving.");
  if (current.userId) {
    if (data.active) await tx.nutritionPlan.updateMany({ where: { userId: current.userId, active: true, id: { not: id } }, data: { active: false } });
    await tx.notification.create({ data: { userId: current.userId, title: "Nutrition plan updated", body: data.title, type: "nutrition" } });
  }
  return tx.nutritionPlan.findUniqueOrThrow({ where: { id } });
}
