import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CoachSetup } from "@/components/auth/coach-setup";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Coach account setup", robots: { index: false, follow: false } };

export default async function SetupPage() {
  const configured = await db.user.count({ where: { role: "COACH" } });
  if (!configured) return <CoachSetup />;
  return <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-5 px-6">
    <h1 className="font-display text-3xl uppercase">Your coach account is ready.</h1>
    <p className="text-muted-foreground">Owner setup is closed. Sign in from the website to open your coach dashboard.</p>
    <Link href="/" className="font-semibold text-primary">Go to website →</Link>
  </main>;
}
