import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach, parseJSON } from "@/lib/server-utils";

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalClients, activeClients, pendingProfiles] = await Promise.all([
    db.user.count({ where: { role: "CLIENT" } }),
    db.clientProfile.count({ where: { status: "ACTIVE" } }),
    db.clientProfile.count({ where: { status: "PENDING" } }),
  ]);

  const verifiedPayments = await db.payment.findMany({ where: { status: "VERIFIED" } });
  const monthlyRevenue = verifiedPayments
    .filter((p) => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amountMAD, 0);

  const totalRevenue = verifiedPayments.reduce((s, p) => s + p.amountMAD, 0);

  // package distribution
  const subs = await db.subscription.findMany({ where: { status: "ACTIVE", OR: [{ endDate: null }, { endDate: { gt: new Date() } }] }, include: { package: true } });
  const pkgMap = new Map<string, number>();
  for (const s of subs) {
    const k = s.package?.title ?? "Unknown";
    pkgMap.set(k, (pkgMap.get(k) ?? 0) + 1);
  }
  const packageDistribution = Array.from(pkgMap.entries()).map(([name, value]) => ({ name, value }));

  // monthly new applications (last 6 months)
  const now = new Date();
  const months: { name: string; applications: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const applications = await db.clientProfile.count({
      where: { createdAt: { gte: d, lt: next } },
    });
    const revenue = verifiedPayments
      .filter((p) => {
        const pd = new Date(p.createdAt);
        return pd >= d && pd < next;
      })
      .reduce((s, p) => s + p.amountMAD, 0);
    months.push({
      name: d.toLocaleString("en-US", { month: "short" }),
      applications,
      revenue,
    });
  }

  // renewals in last 30 days (subscriptions created or ended recently)
  const renewals = await db.subscription.count({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
  });

  return NextResponse.json({
    totalClients,
    activeClients,
    pendingProfiles,
    monthlyRevenue,
    totalRevenue,
    newApplications: pendingProfiles,
    packageDistribution,
    monthlyTrend: months,
    renewals,
    totalPayments: await db.payment.count(),
    pendingPayments: await db.payment.count({ where: { status: "PENDING" } }),
  });
}
