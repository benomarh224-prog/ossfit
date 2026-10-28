import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signedInDestination } from "@/lib/login-access";
import { AdminApp } from "@/components/admin/admin-app";
import { AdminLogin } from "@/components/auth/admin-login";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Coach administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (signedInDestination(session?.user) === "/admin") return <AdminApp />;
  return <AdminLogin clientSignedIn={signedInDestination(session?.user) === "/account"} />;
}
