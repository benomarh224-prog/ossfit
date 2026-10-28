import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/server-utils";
import { overviewSnapshot } from "@/lib/overview-snapshot";

export async function GET() {
  const session = await requireClient();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await overviewSnapshot(db, session.user.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load your daily overview." }, { status: 503 });
  }
}
