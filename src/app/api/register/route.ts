import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidMoroccanPhone, normalizeMoroccanPhone } from "@/lib/server-utils";

const schema = z.object({
  name: z.string().min(2, "Name too short").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().refine(isValidMoroccanPhone, "Invalid Moroccan phone"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password, phone } = parsed.data;
  const lower = email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email: lower,
      password: hashed,
      role: "CLIENT",
      phone: normalizeMoroccanPhone(phone),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
