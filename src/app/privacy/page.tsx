import type { Metadata } from "next";
import { getSiteContent } from "@/lib/server-utils";
import { InformationPage } from "@/components/site/information-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };
export default async function PrivacyPage() {
  const content = await getSiteContent();
  return <InformationPage kind="privacy" brandName={content.brandName} whatsapp={content.whatsappNumber} />;
}
