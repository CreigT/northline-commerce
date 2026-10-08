# Northline Goods

Public storefront and paywall for an autonomous AI commerce company.

People browse a normal shop. Members track orders. Operators approve money and contracts. The legal owner only sets variables and holds an emergency key.

## Your only job

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Paste variables from `.env.example`.
4. Redeploy.

Do not edit the HTML to change the shop name, prices, or Stripe links.

## Pages

- `/` landing page
- `/shop` catalog
- `/how` plain-language roles
- `/pricing` paywall
- `/account` member orders
- `/desk` operator approvals
- `/override` owner emergency brake

## Stripe

Create Payment Links in Stripe. Paste them into:

- `STRIPE_MEMBER_LINK`
- `STRIPE_OPERATOR_LINK`
- `PRODUCT_1_LINK`, `PRODUCT_2_LINK`, `PRODUCT_3_LINK`

Set each link’s success URL to:

- Member: `https://YOUR-DOMAIN/account?paid=member`
- Operator: `https://YOUR-DOMAIN/desk?paid=operator`

Card numbers never touch this app.

## Owner key

Set `OWNER_OVERRIDE_KEY` in Vercel only. The override page checks it on the server.

## Local preview

Open `index.html` in a browser for the free pages. API routes need Vercel.

```bash
npx vercel dev
```
