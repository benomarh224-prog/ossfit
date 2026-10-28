# Coach Oussama

A custom coaching website and private client workspace built with Next.js 16, React 19, Prisma 6 and PostgreSQL.

## Run locally

Use Node.js 24 and npm. Copy `.env.example` to `.env` and supply a **development** PostgreSQL database, a private Blob store credential and your own session secret. Never commit `.env`.

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run dev
```

`npm run build` generates Prisma Client, applies committed migrations to the configured database and builds Next.js. On Vercel, pushes to `main` deploy production. Use a separate database for preview/development; the current Marketplace integration initially connected preview and production to the same database.

## Owner handoff

1. Open the private owner setup link supplied separately. Choose the coach email and a password of at least 12 characters. The link closes permanently after the first coach account is created.
2. Open `/admin` and sign in with the coach account to open administration. This page also lets you switch from an active subscriber session. Ordinary public registration creates subscriber accounts and never grants coach access. A successful sign-in fully reloads the destination to discard the previous account's router and query caches. `View site` opens the public page in another tab.
   In **Account settings**, change the sign-in email and/or password by confirming the current password. All sessions are revoked after saving; sign in again with the updated credentials. Clients have the same controls in their Profile section.
   Generate a **coach recovery key** while you know your current password and keep it in a password manager. It is shown only when generated, works once for one year, and is invalidated by an email/password change or a replacement key. Use `/reset-password` if you need it. Anyone with this key can reset the coach password.
   A coach can generate a client's one-use 15-minute recovery link from their client profile, after confirming the coach password. Verify the client's identity through an already-known contact before sharing. The application does not send WhatsApp messages automatically. Email recovery is not enabled: there is no connected email provider or verified sending domain.
3. Review the coach name, professional contact details, images and copy in Site Content. The surname and exact city were not supplied. The current training imagery is illustrative, not a verified portrait of the coach.
4. Confirm the package scope and prices: 399 / 699 / 1199 MAD per month. The coach can edit, hide or add packages.
5. Enter the real bank beneficiary, IBAN/RIB and payment instructions before accepting transfers. The site does not charge cards or renew subscriptions automatically.
6. Add only consented client testimonials and transformation images. No invented client results are seeded publicly.
7. Review the privacy notice and agree service start dates, renewals, cancellations and refund conditions with clients. The information pages describe the application; they do not establish a jurisdiction-specific legal compliance review.
8. Transfer or arrange ownership of the GitHub repository, Vercel project, domain, database and Blob store with the buyer. Hosting and storage usage remain billed to the account that owns them.
9. Open **Launch checklist** in administration for live checks of filled-in contact, bank, package, portrait and recovery settings, and a practical launch guide. These checks do not certify the accuracy of business details or replace real phone testing and a backup restore drill.

## Coaching workflow

The client home screen prioritizes the next action, the next session in the assigned plan, today's meal/water totals, and the latest coach message or check-in feedback. Shortcuts open the actual dashboard sections; the session shortcut highlights and selects the suggested day in the workout logger. Session suggestions use the previous log for the current plan and preserve the coach's rest-day instructions; the application does not invent calendar training dates. Missing targets and unavailable daily data show explicit empty/loading/error states. Today's totals and meal/water lists use `Africa/Casablanca` calendar boundaries, including offset changes. Overview reads do not mark private messages as read. Recording a workout, meal, water or check-in invalidates the overview; it also refreshes on focus and the next coaching midnight.

The **Messages** section lets the coach read and answer each client's private conversation. Clients see the same conversation in their dashboard. Messages are bounded to 4,000 characters, sent transactionally with notifications, and paged in groups of 50. The active conversation refreshes every 30 seconds while the page is visible. The notification bell displays the latest 30 notices, refreshes on opening/focus and supports marking only displayed notices as read.

In a client profile the coach can review the latest 20 weekly check-ins, write feedback and see the latest 12 private progress photos. Check-in feedback rejects stale concurrent edits and notifies the client. Additional history remains stored; the coach preview intentionally shows only the latest items.

The client's nutrition screen shows the coach's actual meal suggestions and notes separately from **Log your meal**, which records what the client ate. Approving an assessment never activates an unpaid subscription. Payment verification activates service transactionally; retries do not activate twice, and a renewal preserves remaining paid days. Reusing the same proof returns the existing submission, while another pending proof for the same package is rejected for coach review.

## Access and uploads

The appearance menu in the website and dashboards offers Light, Dark and Use device setting. The choice persists in the browser. The original dark appearance remains the default until a visitor selects another option.

Client uploads are private to their owner and the coach. Marketing uploads by the coach are public content; these images are decoded, stripped of metadata, resized and converted to WebP (3 MB input limit, 30 uploads per account per rolling day).

Workout and nutrition plans support separate **private photo/video attachments**. Save a plan to open its attachment editor, or choose `View / add media` on an existing plan. Photos may be JPG/PNG/WebP up to 10 MB; videos may be MP4/WebM/MOV up to 100 MB. MP4 with a browser-compatible codec is recommended; video transcoding is not included. Coaching attachments retain their original file contents and metadata. They upload directly to private Blob storage with scoped, expiring grants and a limit of 30 upload grants per coach per day. File format signatures and sizes are checked before attachment. Only the coach and the assigned trainee with an active plan can read these files; video byte-range responses support phone playback and seeking.

Dialogs use the available viewport height. The client profile and plan editors keep their Back button and actions outside the scrolling content on phones.

The coach can choose **Edit** on workout and nutrition plans to update their content and active status. Editing preserves the existing plan ID, assigned trainee, attachments and past logs. The trainee field is locked during editing. Activating a plan deactivates other plans of the same kind for that trainee; writes are transactional and concurrent stale edits are rejected with a request to reopen the editor.

Bank account fields are omitted from anonymous page data. Registration and sign-in are rate limited through PostgreSQL. Prices and payment ownership are checked on the server.

## Checks

```sh
npm test
npm run typecheck
npm audit
npm run build
```

The private owner setup link, recovery keys and client recovery links must never be committed, included in a sales listing or shared publicly. Recovery secrets are random, stored only as SHA-256 hashes and tied to the account's session version. Reset links carry their secret in the URL fragment; the browser removes it after filling the form. Expired, consumed or revoked keys cannot reset a password. Resetting revokes previous sessions and never changes the account role.

Production build, type and service checks are automated. Real authenticated coach/client phone testing remains required; browser automation is disabled in the current workspace. A database backup, media backup, restore test, dedicated preview database and custom domain are not provisioned by these code changes. See [OWNER-GUIDE.md](OWNER-GUIDE.md) for the handoff checklist.
