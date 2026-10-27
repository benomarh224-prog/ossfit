import type { SiteContent } from "@prisma/client";

export function publicSiteContent(content: SiteContent) {
  const { bankName, bankAccountName, bankIban, bankRIB, ...publicContent } = content;
  return publicContent;
}
