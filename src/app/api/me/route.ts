import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, parseJSON } from "@/lib/server-utils";
import { withSubscriptionStatus } from "@/lib/subscription-status";

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, workoutPlan, nutritionPlan, messagesCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: { include: { preferredPkg: true } },
        subscriptions: {
          include: { package: true, payments: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        payments: { include: { subscription: { include: { package: true } } }, orderBy: { createdAt: "desc" } },
      },
    }),
    db.workoutPlan.findFirst({
      where: { userId: session.user.id, active: true },
      orderBy: { createdAt: "desc" },
    }),
    db.nutritionPlan.findFirst({
      where: { userId: session.user.id, active: true },
      orderBy: { createdAt: "desc" },
    }),
    db.message.count({ where: { clientId: session.user.id, sender: "COACH", read: false } }),
  ]);

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = user.clientProfile
    ? { ...user.clientProfile, equipment: parseJSON<string[]>(user.clientProfile.equipment, []) }
    : null;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
    profile,
    activeSubscription: user.subscriptions[0] ? withSubscriptionStatus(user.subscriptions[0]) : null,
    payments: user.payments.map((p) => ({
      ...p,
      packageTitle: p.subscription?.package?.title ?? p.packageTitle,
    })),
    workoutPlan: workoutPlan
      ? { ...workoutPlan, days: parseJSON(workoutPlan.daysJson, []) }
      : null,
    nutritionPlan: nutritionPlan
      ? { ...nutritionPlan, meals: parseJSON(nutritionPlan.mealsJson, []) }
      : null,
    unreadMessages: messagesCount,
  });
}
