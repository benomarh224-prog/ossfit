import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { planTargetSchema } from "@/lib/media-policy";
import { findMediaPlan } from "@/lib/plan-media-server";
import { canReadPlanMedia } from "@/lib/upload-access";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = planTargetSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  const { kind, planId } = parsed.data;
  const plan = await findMediaPlan(kind, planId);
  if (!canReadPlanMedia(plan, session.user)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const media = await db.planMedia.findMany({ where: kind === "workout" ? { workoutPlanId: planId } : { nutritionPlanId: planId }, include: { upload: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ media: media.map((item) => ({ id: item.id, name: item.name, contentType: item.upload.contentType, size: item.upload.size, url: `/api/uploads/${item.uploadId}` })) }, { headers: { "Cache-Control": "private, no-store" } });
}
