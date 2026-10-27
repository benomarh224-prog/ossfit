-- Original service content, without demo clients, testimonials or outcome claims.
WITH defaults ("id","slug","title","shortDesc","longDesc","icon","image","features","order") AS (VALUES
('svc-online-personal-coaching', 'online-personal-coaching', 'Personal Training', 'A clear workout plan built around your goals, level and equipment.', 'Training that fits your schedule, with exercises, sets and guidance in your private dashboard.', 'dumbbell', '/images/service-coaching.jpg', '["Your own training plan","Home or gym workouts","Progress check-ins"]', 1),
('svc-body-transformation', 'body-transformation', 'Body Recomposition', 'Build strength and consistency with a plan you can keep following.', 'Combine structured training, realistic habits and regular feedback. Your program evolves with your progress.', 'flame', '/images/service-transformation.jpg', '["Realistic goals","Regular program reviews","Private progress tracking"]', 2),
('svc-nutrition-guidance', 'nutrition-guidance', 'Nutrition Guidance', 'Make everyday food choices work for your training.', 'Practical meal guidance and nutrition targets that fit your routine. Educational coaching, not medical treatment.', 'salad', '/images/service-nutrition.jpg', '["Practical meal guidance","Personal nutrition targets","Daily habit tracking"]', 3),
('svc-one-to-one-consultation', 'one-to-one-consultation', 'One-to-One Coaching', 'Talk through your goals before choosing your next step.', 'Book an online consultation with Coach Oussama to discuss your routine, training experience and the support you need.', 'video', '/images/service-consultation.jpg', '["Online consultation","Goal assessment","Clear next steps"]', 4)
)
INSERT INTO "Service" ("id","slug","title","shortDesc","longDesc","icon","image","features","order","published","createdAt","updatedAt")
SELECT *, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM defaults
WHERE NOT EXISTS (SELECT 1 FROM "Service") ON CONFLICT DO NOTHING;

WITH defaults ("id","question","answer","category","order") AS (VALUES
('faq-1', 'How do I start?', 'Choose a package, create your account and complete your fitness assessment. Coach Oussama reviews your goals and contacts you about the next steps.', 'Getting started', 1),
('faq-2', 'Can I train at home?', 'Yes. Your assessment asks about your equipment and experience so your program can suit home training or a gym.', 'Training', 2),
('faq-3', 'How do payments work?', 'Payments are made by bank transfer in Moroccan dirhams. Confirm the bank details with the coach, upload your proof privately and wait for verification. Uploading a proof does not automatically activate a subscription.', 'Payments', 3),
('faq-4', 'When will I receive my program?', 'The coach prepares your plan after reviewing your assessment and confirming your subscription. Agree on the start date directly before you pay.', 'Getting started', 4),
('faq-5', 'Can I book a consultation?', 'Yes. Registered clients can request an available consultation slot from their dashboard. You can also contact Coach Oussama on WhatsApp before joining.', 'Consultations', 5),
('faq-6', 'Can I change or cancel a package?', 'Contact the coach before payment to confirm the package scope, renewal, cancellation and refund conditions that apply to your coaching.', 'Payments', 6),
('faq-7', 'Are results guaranteed?', 'No fixed result can be promised. Progress depends on your starting point, consistency, recovery and other individual factors. Coaching focuses on a realistic plan and regular review.', 'Training', 7),
('faq-8', 'What if I have an injury or a medical condition?', 'Tell the coach about any limitations during your assessment. Get advice from a qualified healthcare professional before starting or changing an exercise or nutrition routine.', 'Wellbeing', 8)
)
INSERT INTO "FAQ" ("id","question","answer","category","order","published","createdAt","updatedAt")
SELECT *, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM defaults
WHERE NOT EXISTS (SELECT 1 FROM "FAQ") ON CONFLICT DO NOTHING;

UPDATE "SiteContent" SET
"brandName" = 'COACH OUSSAMA', "coachName" = 'Oussama', "coachCity" = 'Morocco',
"whatsappNumber" = '+212610296995', "coachPortrait" = '/images/service-coaching.jpg',
"heroTitle" = 'YOUR GOAL. YOUR PLAN. YOUR PROGRESS.',
"heroSubtitle" = 'Build a stronger routine with Coach Oussama. Personal training, practical nutrition guidance and a private space to track every step — wherever you train.',
"aboutStory" = 'Your training should fit your life. We start with your goals, experience and available equipment, then build a practical plan around you. Your private dashboard keeps your workouts, check-ins and coach conversations together.',
"aboutPhilosophy" = 'Consistency beats extremes. Clear sessions, realistic habits and honest feedback make it easier to keep showing up. We review your progress and adapt your plan as your needs change.',
"updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'singleton';
