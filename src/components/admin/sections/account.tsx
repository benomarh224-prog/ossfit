"use client";
import { AccountSettings } from "@/components/auth/account-settings";
import { RecoveryManager } from "@/components/auth/recovery-manager";
export default function AccountSection() {
  return <div className="mx-auto max-w-xl space-y-5"><AccountSettings coach /><RecoveryManager /></div>;
}
