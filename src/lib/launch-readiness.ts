import { isValidMoroccanPhone } from "./phone.ts";

type LaunchContent = { brandName: string; coachName: string; coachCity: string; whatsappNumber: string; whatsappEnabled: boolean; coachPortrait: string; bankName: string | null; bankAccountName: string | null; bankIban: string | null; bankRIB: string | null };
export function launchChecks(content: LaunchContent, availablePackages: number, recoveryReady: boolean, storageReady: boolean) {
  return {
    identity: !!content.brandName.trim() && !!content.coachName.trim(),
    city: !!content.coachCity.trim() && !["morocco", "maroc", "المغرب"].includes(content.coachCity.trim().toLowerCase()),
    portrait: !!content.coachPortrait && !["/images/service-coaching.jpg", "/images/coach.jpg"].includes(content.coachPortrait),
    contact: content.whatsappEnabled && isValidMoroccanPhone(content.whatsappNumber),
    bank: !!content.bankName?.trim() && !!content.bankAccountName?.trim() && !!(content.bankIban?.trim() || content.bankRIB?.trim()),
    packages: availablePackages > 0,
    recovery: recoveryReady,
    storage: storageReady,
  };
}
