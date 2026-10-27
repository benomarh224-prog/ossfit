import { db } from "@/lib/db";

// Helpers for JSON-encoded string fields (SQLite does not support arrays)
export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJSON(value: unknown): string {
  return JSON.stringify(value);
}

// Moroccan phone validation: accept 06XXXXXXXX / 07XXXXXXXX / +2126... / +2127...
export function isValidMoroccanPhone(input: string): boolean {
  const s = input.replace(/[\s-]/g, "");
  return /^(?:\+212|0)([5-7]\d{8})$/.test(s);
}

// Normalize to international +212XXXXXXXXX form
export function normalizeMoroccanPhone(input: string): string {
  const s = input.replace(/[\s-]/g, "");
  if (s.startsWith("+212")) return s;
  if (s.startsWith("212")) return "+" + s;
  if (s.startsWith("0")) return "+212" + s.slice(1);
  return s;
}

// Build a wa.me link with a pre-filled message
export function whatsappLink(number: string | undefined | null, message: string): string {
  const n = number || process.env.WHATSAPP_DEFAULT_NUMBER || "+212600000000";
  const clean = n.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

// Admin / role guard helper for API routes
export async function getSession() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  return getServerSession(authOptions);
}

export async function requireCoach() {
  const session = await getSession();
  if (!session || session.user.role !== "COACH") return null;
  return session;
}

export async function requireClient() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") return null;
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

// Singleton site content record (created on first access)
export async function getSiteContent() {
  let content = await db.siteContent.findUnique({ where: { id: "singleton" } });
  if (!content) {
    content = await db.siteContent.create({ data: { id: "singleton" } });
  }
  return content;
}
