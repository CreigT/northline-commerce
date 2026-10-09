# Northline Goods

Public shop and paywall. You change variables in Vercel. You do not edit HTML.

## Make it charge cards

1. Import this repo in Vercel. Framework: Other. No build command.
2. Deploy once.
3. Open `/setup` on the live site.
4. Add one of these in Vercel → Settings → Environment Variables, then redeploy.

Fast path: `STRIPE_SECRET_KEY`

- Stripe Dashboard → turn on Test mode
- Developers → API keys
- Copy the Secret key (`sk_test_...`)
- Buy on `/shop` then opens Stripe Checkout

Click path: payment links

- Product catalog → Add product → set price → Save
- Payment links → New → copy `https://buy.stripe.com/...`
- Paste into `PRODUCT_1_LINK`, `PRODUCT_2_LINK`, `PRODUCT_3_LINK`, `STRIPE_MEMBER_LINK`, `STRIPE_OPERATOR_LINK`

Also set `OWNER_OVERRIDE_KEY` before using `/override`.

## Pages

- `/` shop story
- `/shop` buy
- `/pricing` member and operator
- `/setup` what is still missing
- `/account` member orders
- `/desk` operator approvals
- `/override` owner brake

Card numbers stay on Stripe. A paid Checkout return sets a 30-day access cookie.
