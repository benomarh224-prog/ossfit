import type { PrismaClient } from "@prisma/client";
import { COACHING_TIME_ZONE, coachingDayRange } from "./coaching-day.ts";
import { latestCoachUpdate, type OverviewSnapshot } from "./dashboard-overview.ts";

type Store = Pick<PrismaClient, "workoutPlan" | "workoutLog" | "mealLog" | "waterLog" | "message" | "checkIn">;

export async function overviewSnapshot(db: Store, userId: string, now = new Date()): Promise<OverviewSnapshot> {
  const range = coachingDayRange(now);
  const workout = db.workoutPlan.findFirst({ where: { userId, active: true }, orderBy: { createdAt: "desc" }, select: { id: true } }).then(plan => plan ? db.workoutLog.findFirst({ where: { userId, planId: plan.id }, orderBy: { completedAt: "desc" }, select: { planId: true, dayJson: true, completedAt: true } }) : null);
  const [log, meals, water, message, feedback, checkin] = await Promise.all([
    workout,
    db.mealLog.aggregate({ where: { userId, date: { gte: range.start, lt: range.end } }, _count: { _all: true }, _sum: { calories: true, proteinG: true } }),
    db.waterLog.aggregate({ where: { userId, date: { gte: range.start, lt: range.end } }, _sum: { cups: true } }),
    db.message.findFirst({ where: { clientId: userId, sender: "COACH" }, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } }),
    db.checkIn.findFirst({ where: { userId, coachReply: { not: null } }, orderBy: { updatedAt: "desc" }, select: { coachReply: true, weekLabel: true, updatedAt: true } }),
    db.checkIn.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);
  let day: Record<string, unknown> = {};
  if (log) { try { const value = JSON.parse(log.dayJson); if (value && typeof value === "object" && !Array.isArray(value)) day = value; } catch { /* Legacy malformed logs do not block the overview. */ } }
  return {
    asOf: now.toISOString(), dateKey: range.key, timeZone: COACHING_TIME_ZONE,
    latestWorkout: log ? { planId: log.planId, day, completedAt: log.completedAt.toISOString() } : null,
    meals: { count: meals._count._all, calories: meals._sum.calories, proteinG: meals._sum.proteinG },
    waterCups: Math.max(0, water._sum.cups ?? 0), coachUpdate: latestCoachUpdate(message, feedback), latestCheckinAt: checkin?.createdAt.toISOString() ?? null,
  };
}
