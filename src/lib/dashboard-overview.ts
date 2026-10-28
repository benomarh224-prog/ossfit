import { coachingDateKey } from "./coaching-day.ts";

export type ClientSection = "overview" | "workouts" | "nutrition" | "progress" | "messages" | "subscription" | "consultations" | "profile";
export type WorkoutDayPreview = { name?: string; day?: string; focus?: string; exercises?: { name: string; sets?: string; reps?: string; rest?: string }[] };
export type LatestWorkout = { planId: string | null; day: Record<string, unknown>; completedAt: string };
export type CoachUpdate = { kind: "message" | "checkin"; body: string; at: string; weekLabel?: string };
export type OverviewSnapshot = {
  asOf: string; dateKey: string; timeZone: string;
  latestWorkout: LatestWorkout | null;
  meals: { count: number; calories: number | null; proteinG: number | null };
  waterCups: number; coachUpdate: CoachUpdate | null; latestCheckinAt: string | null;
};

export function workoutDayName(day: WorkoutDayPreview) { return day.name || day.day || ""; }

export function nextWorkout(plan: { id: string; days: WorkoutDayPreview[] } | null, log: LatestWorkout | null, dateKey: string) {
  if (!plan?.days.length) return { index: 0, completedToday: false };
  if (!log || log.planId !== plan.id) return { index: 0, completedToday: false };
  const name = typeof log.day.name === "string" ? log.day.name : typeof log.day.day === "string" ? log.day.day : "";
  const index = name ? plan.days.findIndex(day => workoutDayName(day) === name) : -1;
  return { index: index < 0 ? 0 : (index + 1) % plan.days.length, completedToday: coachingDateKey(log.completedAt) === dateKey };
}

export function latestCoachUpdate(message: { body: string; createdAt: Date | string } | null, checkin: { coachReply: string | null; weekLabel: string; updatedAt: Date | string } | null): CoachUpdate | null {
  const reply = checkin?.coachReply?.trim();
  if (reply && (!message || new Date(checkin!.updatedAt) >= new Date(message.createdAt))) return { kind: "checkin", body: reply, weekLabel: checkin!.weekLabel, at: new Date(checkin!.updatedAt).toISOString() };
  return message ? { kind: "message", body: message.body, at: new Date(message.createdAt).toISOString() } : null;
}

export type NextStep = "assessment" | "contact" | "paymentPending" | "paymentNeeded" | "messages" | "planPending" | "workout" | "checkin" | "nutrition" | "progress";
export function nextOverviewStep(input: { profileStatus?: string; subscriptionStatus?: string; pendingPayment: boolean; unread: number; hasWorkout: boolean; hasNutrition: boolean; completedToday: boolean; checkinAt: string | null; profileCreatedAt?: string; now: string }): { kind: NextStep; section: ClientSection } {
  if (["PAUSED", "REJECTED"].includes(input.profileStatus ?? "")) return { kind: "contact", section: "messages" };
  if (input.profileStatus === "PENDING") return { kind: "assessment", section: "messages" };
  if (input.pendingPayment) return { kind: "paymentPending", section: "subscription" };
  if (input.subscriptionStatus !== "ACTIVE") return { kind: "paymentNeeded", section: "subscription" };
  if (input.unread > 0) return { kind: "messages", section: "messages" };
  if (!input.hasWorkout && !input.hasNutrition) return { kind: "planPending", section: "messages" };
  if (input.hasWorkout && !input.completedToday) return { kind: "workout", section: "workouts" };
  const previous = input.checkinAt || input.profileCreatedAt;
  if (previous && new Date(input.now).getTime() - new Date(previous).getTime() >= 7 * 86400000) return { kind: "checkin", section: "progress" };
  if (input.hasNutrition) return { kind: "nutrition", section: "nutrition" };
  return { kind: "progress", section: "progress" };
}
