export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://ossfit-rjh1.vercel.app";
  return new URL(configured).origin;
}
