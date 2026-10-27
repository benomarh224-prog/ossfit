import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { allowRequest, requestIp } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(32).max(256),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long"),
});

export async function POST(req: NextRequest) {
  const expected = process.env.COACH_SETUP_TOKEN_HASH;
  if (!expected || !/^[a-f0-9]{64}$/.test(expected)) return NextResponse.json({ error: "Setup is not enabled" }, { status: 404 });
  if (!await allowRequest("coach-setup", requestIp(req.headers), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid details" }, { status: 400 });
  const { token, name, password } = parsed.data;
  const actual = createHash("sha256").update(token).digest();
  if (!timingSafeEqual(Buffer.from(expected, "hex"), actual)) return NextResponse.json({ error: "Invalid setup link" }, { status: 403 });
  const email = parsed.data.email.toLowerCase();
  if (await db.user.count({ where: { role: "COACH" } })) return NextResponse.json({ error: "Coach account already configured. Please sign in." }, { status: 409 });
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "This email already has an account. Use a different coach email." }, { status: 409 });
  const hashed = await bcrypt.hash(password, 12);
  try {
    await db.$transaction(async (tx) => {
      // A unique marker makes the owner link single-use, even for simultaneous requests.
      await tx.coachSetup.create({ data: { id: "initial-coach" } });
      await tx.user.create({ data: { email, name, role: "COACH", password: hashed, phone: "+212610296995" } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Setup is already complete or this email is in use." }, { status: 409 });
    }
    console.error("Coach setup failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Setup is temporarily unavailable. Try again." }, { status: 503 });
  }
}
