import { db } from "@/lib/db";

// Helpers for JSON-encoded string fields.
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

export { isValidMoroccanPhone, normalizeMoroccanPhone } from "@/lib/phone";

// Build a wa.me link with a pre-filled message
export function whatsappLink(number: string | undefined | null, message: string): string {
  const n = number || process.env.WHATSAPP_DEFAULT_NUMBER || "+212610296995";
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
  if (!session?.user?.id) return null;
  return session;
}

// Singleton site content record (created on first access)
export async function getSiteContent() {
  return db.siteContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
}
