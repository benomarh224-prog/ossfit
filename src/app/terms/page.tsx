import type { Metadata } from "next";
import { getSiteContent } from "@/lib/server-utils";
import { InformationPage } from "@/components/site/information-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Coaching and payment information", alternates: { canonical: "/terms" } };
export default async function TermsPage() {
  const content = await getSiteContent();
  return <InformationPage kind="terms" brandName={content.brandName} whatsapp={content.whatsappNumber} />;
}
