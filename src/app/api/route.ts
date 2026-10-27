import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", application: "Coach Oussama" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "temporarily_unavailable" }, { status: 503 });
  }
}
