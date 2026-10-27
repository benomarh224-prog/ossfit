import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, toJSON } from "@/lib/server-utils";

const schema = z.object({
  fullName: z.string().min(2),
  age: z.number().int().min(13).max(100),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  city: z.string().min(2),
  goal: z.enum(["muscle", "fat_loss", "recomp", "strength", "health"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  equipment: z.array(z.string()),
  weeklyAvailability: z.enum(["avail2", "avail4", "avail6"]),
  preferredPackageId: z.string().optional(),
  limitations: z.string().optional(),
  injuryConsent: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  await db.clientProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      fullName: d.fullName,
      age: d.age,
      heightCm: d.heightCm,
      weightKg: d.weightKg,
      city: d.city,
      goal: d.goal,
      experience: d.experience,
      equipment: toJSON(d.equipment),
      weeklyAvailability: d.weeklyAvailability,
      preferredPackageId: d.preferredPackageId,
      limitations: d.limitations ?? null,
      injuryConsent: d.injuryConsent,
      onboarded: true,
      status: "PENDING",
    },
    update: {
      fullName: d.fullName,
      age: d.age,
      heightCm: d.heightCm,
      weightKg: d.weightKg,
      city: d.city,
      goal: d.goal,
      experience: d.experience,
      equipment: toJSON(d.equipment),
      weeklyAvailability: d.weeklyAvailability,
      preferredPackageId: d.preferredPackageId,
      limitations: d.limitations ?? null,
      injuryConsent: d.injuryConsent,
      onboarded: true,
      status: "PENDING",
    },
  });

  // Create a subscription request tied to the chosen package
  if (d.preferredPackageId) {
    const pkg = await db.package.findUnique({ where: { id: d.preferredPackageId } });
    if (pkg) {
      await db.subscription.create({
        data: {
          userId: session.user.id,
          packageId: pkg.id,
          amountMAD: pkg.priceMAD,
          status: "PENDING",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
