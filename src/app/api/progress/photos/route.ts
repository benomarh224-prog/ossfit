import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

const schema = z.object({
  url: z.string().regex(/^\/api\/uploads\/[a-zA-Z0-9_-]+$/, "Upload an image first"),
  type: z.enum(["front", "side", "back"]).default("front"),
  note: z.string().optional(),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const photos = await db.progressPhoto.findMany({
    where: { userId: session.user.id },
    orderBy: { takenAt: "desc" },
  });
  return NextResponse.json({ photos });
}

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
  const upload = await db.uploadedFile.findFirst({ where: {
    id: d.url.split("/").pop(), ownerId: session.user.id, visibility: "PRIVATE",
  } });
  if (!upload) return NextResponse.json({ error: "Image not found" }, { status: 400 });
  const photo = await db.progressPhoto.create({
    data: { ...d, userId: session.user.id, takenAt: new Date() },
  });
  return NextResponse.json({ ok: true, photo });
}
