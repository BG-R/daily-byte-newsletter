# daily-byte-newsletter

A $1/month tech newsletter powered by Stripe subscriptions and AI‑generated daily summaries.

## Features

- Stripe Checkout for $1/month recurring subscription
- SQLite database to store subscribers & status
- Webhook handling for subscription lifecycle (active / past_due)
- Daily cron job that:
  - Fetches top tech headlines
  - Uses OpenAI to generate a concise summary
  - Emails the summary to all active subscribers

## Setup

```bash
git clone <repo-url>
cd daily-byte-newsletter
npm install
cp .env.example .env
# Fill in the .env values
npm start
```

## Environment variables

See `.env.example` for the full list:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `DOMAIN`
- `OPENAI_API_KEY`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `PORT` (optional, defaults to 4242)

## Stripe Webhooks

After deploying, add a webhook endpoint at:

```
https://YOUR_DOMAIN/webhook
```

and subscribe to:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`

## License

MIT
