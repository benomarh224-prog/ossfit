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
2. Sign in from the website to open the coach dashboard. `View site` opens the public page in another tab.
3. Review the coach name, professional contact details, images and copy in Site Content. The surname and exact city were not supplied. The current training imagery is illustrative, not a verified portrait of the coach.
4. Confirm the package scope and prices: 399 / 699 / 1199 MAD per month. The coach can edit, hide or add packages.
5. Enter the real bank beneficiary, IBAN/RIB and payment instructions before accepting transfers. The site does not charge cards or renew subscriptions automatically.
6. Add only consented client testimonials and transformation images. No invented client results are seeded publicly.
7. Review the privacy notice and agree service start dates, renewals, cancellations and refund conditions with clients. The information pages describe the application; they do not establish a jurisdiction-specific legal compliance review.
8. Transfer or arrange ownership of the GitHub repository, Vercel project, domain, database and Blob store with the buyer. Hosting and storage usage remain billed to the account that owns them.

## Access and uploads

Client uploads are private to their owner and the coach. Coach uploads are intended for public marketing content. Images are decoded, stripped of metadata, resized and converted to WebP. The input limit is 3 MB and 30 uploads per account per rolling day. Uploaded images persist in a private Vercel Blob store, with access enforced through the application.

Bank account fields are omitted from anonymous page data. Registration and sign-in are rate limited through PostgreSQL. Prices and payment ownership are checked on the server.

## Checks

```sh
npm test
npm run typecheck
npm audit
npm run build
```

The private owner setup link must never be committed, included in a sales listing or forwarded to anyone except the intended owner. Password recovery by email is not implemented; keep the coach credentials in a password manager and arrange a verified support procedure before broad public launch.
