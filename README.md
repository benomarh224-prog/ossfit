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
   In **Account settings**, change the sign-in email and/or password by confirming the current password. All sessions are revoked after saving; sign in again with the updated credentials. Email recovery for a forgotten password is not implemented.
3. Review the coach name, professional contact details, images and copy in Site Content. The surname and exact city were not supplied. The current training imagery is illustrative, not a verified portrait of the coach.
4. Confirm the package scope and prices: 399 / 699 / 1199 MAD per month. The coach can edit, hide or add packages.
5. Enter the real bank beneficiary, IBAN/RIB and payment instructions before accepting transfers. The site does not charge cards or renew subscriptions automatically.
6. Add only consented client testimonials and transformation images. No invented client results are seeded publicly.
7. Review the privacy notice and agree service start dates, renewals, cancellations and refund conditions with clients. The information pages describe the application; they do not establish a jurisdiction-specific legal compliance review.
8. Transfer or arrange ownership of the GitHub repository, Vercel project, domain, database and Blob store with the buyer. Hosting and storage usage remain billed to the account that owns them.

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

The private owner setup link must never be committed, included in a sales listing or forwarded to anyone except the intended owner. Password recovery by email is not implemented; keep the coach credentials in a password manager and arrange a verified support procedure before broad public launch.
