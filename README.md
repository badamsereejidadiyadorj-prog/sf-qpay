# qpay — Usage Guide

This project was converted to a Next.js app. Server-side API routes for interacting with QPay are under pages/api/qpay.

**Prerequisites**

- Node.js 18+ (recommended)
- npm (or yarn)

**Files of interest**

- [lib/qpay.js](lib/qpay.js) — helper for token acquisition and config.
- [pages/api/qpay/create.js](pages/api/qpay/create.js) — endpoint to create invoices.
- [pages/api/qpay/check/[invoiceId].js](pages/api/qpay/check/[invoiceId].js) — endpoint to check invoice status.
- [pages/api/qpay/callback.js](pages/api/qpay/callback.js) — callback endpoint for QPay webhooks.
- [server.old.js](server.old.js) — original Express server preserved for reference.

Setup

1. Copy the example env and fill values:

Windows (cmd):

```bash
copy .env.local.example .env.local
```

Unix/macOS:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and set:

- `QPAY_MERCHANT_ID` — your merchant id
- `QPAY_SECRET_KEY` — your secret key
- `QPAY_INVOICE_CODE` — invoice code
- `NEXT_PUBLIC_SITE_URL` — the public site base URL (used for callback URL)

3. Install dependencies and run in development:

```bash
npm install
npm run dev
```

Production build

```bash
npm run build
npm start
```

API Endpoints

1. Create invoice

- URL: `POST /api/qpay/create`
- Body (JSON):

```json
{
  "invoiceNumber": "INV-001",
  "invoiceReceiverCode": "12345678",
  "amount": 1000,
  "items": [{ "name": "Item A", "qty": 1 }]
}
```

curl example:

```bash
curl -X POST http://localhost:3000/api/qpay/create \
	-H "Content-Type: application/json" \
	-d '{"invoiceNumber":"INV-001","invoiceReceiverCode":"12345678","amount":1000,"items":[{"name":"Item A","qty":1}]}'
```

JavaScript fetch example:

```js
const resp = await fetch("/api/qpay/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    invoiceNumber: "INV-001",
    invoiceReceiverCode: "12345678",
    amount: 1000,
    items: [],
  }),
});
const data = await resp.json();
```

2. Check invoice

- URL: `GET /api/qpay/check/:invoiceId`

curl example:

```bash
curl http://localhost:3000/api/qpay/check/INVOICE_ID
```

3. Callback (webhook)

- URL: `POST /api/qpay/callback` — QPay will POST the callback payload here. The route verifies the invoice and currently logs/returns success. Implement your own DB/order update logic in pages/api/qpay/callback.js.

Notes and tips

- Environment: Keep credentials out of source control. `.env.local` is gitignored by default.
- `NEXT_PUBLIC_SITE_URL` is used to build the callback URL; set it to your deployed site when deploying.
- The API routes use server-side `fetch` and `process.env` values. No client-side exposure of secrets occurs.
- If you need the original Express server, run `node server.old.js` (not used by Next.js runtime).

Troubleshooting

- 401/authorization errors: verify `QPAY_MERCHANT_ID` and `QPAY_SECRET_KEY` in `.env.local`.
- Network or fetch errors: ensure your host can reach `https://merchant.qpay.mn/v2`.

Next steps you might want me to do

- Add a simple frontend form that calls `/api/qpay/create` and displays the QR link/response.
- Add automated tests for the API routes (mocking QPay responses).

License

See repository root for license information.
"# sf-qpay"
