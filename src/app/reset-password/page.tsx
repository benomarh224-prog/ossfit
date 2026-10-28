import type { Metadata } from "next";
import { getSiteContent } from "@/lib/server-utils";
import { ResetPassword } from "@/components/auth/reset-password";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account recovery", robots: { index: false, follow: false }, referrer: "no-referrer", alternates: { canonical: "/reset-password" } };

export default async function Page() {
  const content = await getSiteContent();
  return <ResetPassword whatsapp={content.whatsappNumber} />;
}
