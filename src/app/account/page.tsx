import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { signedInDestination } from "@/lib/login-access";
import { ClientApp } from "@/components/dashboard/client-app";
import { AccountLogin } from "@/components/auth/account-login";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your coaching account", robots: { index: false, follow: false }, alternates: { canonical: "/account" } };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const destination = signedInDestination(session?.user);
  if (destination === "/admin") redirect(destination);
  if (destination === "/account") return <ClientApp />;
  return <AccountLogin />;
}
