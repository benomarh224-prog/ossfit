export const HERO_CAMPAIGN_IMAGE = "/images/hero-strength-v2.webp";
export const HERO_CAMPAIGN_MOBILE = "/images/hero-strength-v2-mobile.webp";

// Upgrade the original stock image without replacing a coach-uploaded campaign.
export function heroImageSource(source?: string | null) {
  return !source || source === "/images/hero.jpg" ? HERO_CAMPAIGN_IMAGE : source;
}
