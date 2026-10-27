import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, getSiteContent } from "@/lib/server-utils";

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

const schema = z.object({
  brandName: z.string().optional(),
  coachName: z.string().optional(),
  coachCity: z.string().optional(),
  whatsappNumber: z.string().optional(),
  whatsappEnabled: z.boolean().optional(),
  heroImage: z.string().optional(),
  coachPortrait: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  aboutStory: z.string().optional(),
  aboutPhilosophy: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankIban: z.string().optional(),
  bankRIB: z.string().optional(),
  paymentInstructions: z.string().optional(),
  heroStatClients: z.number().int().min(0).optional(),
  heroStatPrograms: z.number().int().min(0).optional(),
  heroStatYears: z.number().int().min(0).optional(),
  heroStatSuccess: z.number().int().min(0).max(100).optional(),
  statsVerified: z.boolean().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const updated = await db.siteContent.update({
    where: { id: "singleton" },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, content: updated });
}
