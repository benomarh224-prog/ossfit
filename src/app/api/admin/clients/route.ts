import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach, parseJSON } from "@/lib/server-utils";

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await db.user.findMany({
    where: { role: "CLIENT" },
    include: {
      clientProfile: { include: { preferredPkg: true } },
      subscriptions: { include: { package: true }, orderBy: { createdAt: "desc" }, take: 1 },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      profile: c.clientProfile
        ? { ...c.clientProfile, equipment: parseJSON<string[]>(c.clientProfile.equipment, []) }
        : null,
      activeSubscription: c.subscriptions[0] ?? null,
      lastPayment: c.payments[0] ?? null,
    })),
  });
}
