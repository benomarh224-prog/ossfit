-- Populate the original pricing tiers on installations without any packages.
-- Existing packages, including unavailable ones, remain under coach control.
WITH defaults ("id", "slug", "title", "tagline", "priceMAD", "supportLevel", "featured", "order", "features") AS (
    VALUES
    (
        'pkg-basic-coaching', 'basic-coaching', 'Basic Coaching',
        'Start your journey with structured guidance', 399, 'Email support', false, 1,
        '["Personalized monthly workout plan","Basic nutrition targets","Monthly program update","Email support","Progress tracking access"]'
    ),
    (
        'pkg-premium-coaching', 'premium-coaching', 'Premium Coaching',
        'Complete coaching with weekly monitoring', 699, 'Weekly check-ins + WhatsApp', true, 2,
        '["Everything in Basic","Weekly progress monitoring","Personalized nutrition plan","Exercise technique feedback","WhatsApp support","Program adjustments every 2 weeks"]'
    ),
    (
        'pkg-vip-transformation', 'vip-transformation', 'VIP Transformation',
        'Maximum support for full transformation', 1199, 'Daily support + calls', false, 3,
        '["Everything in Premium","Daily coach availability","Bi-weekly video calls","Custom nutrition adjustments","Priority program updates","Progress photo reviews"]'
    )
)
INSERT INTO "Package" (
    "id", "slug", "title", "tagline", "priceMAD", "durationLabel", "features",
    "supportLevel", "available", "featured", "order", "createdAt", "updatedAt"
)
SELECT "id", "slug", "title", "tagline", "priceMAD", 'Per month', "features",
       "supportLevel", true, "featured", "order", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM defaults
WHERE NOT EXISTS (SELECT 1 FROM "Package")
ON CONFLICT DO NOTHING;
