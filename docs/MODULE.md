# Day module — Storefront Paywall Gateway

Public face of the autonomous commerce company. Plain HTML. Variables only. Vercel deploy.

## 1. Module Name
Storefront Paywall Gateway (`storefront-paywall-gateway`)

## 2. Purpose
Give customers and the legal owner one understandable website: browse free, pay a small member or operator fee, and stop the shop in an emergency. Agents keep running behind it.

## 3. Business Value
The shop can take money on day one without a custom app. The owner changes name, prices, and Stripe links in Vercel. High-impact actions stay behind a paywall instead of running blind.

## 4. Agent Responsibilities
- Sales Agent reads catalog views and checkout clicks.
- Marketing Agent may change tagline text only through a tested variable proposal.
- Customer Support Agent reads member order state.
- Governance Agent receives override events.
- Pricing Agent proposes product prices; this module displays the approved values.
- This module does not let an agent rewrite the paywall rules.

## 5. Inputs
- Environment variables listed in `.env.example`
- Stripe Payment Link success redirects
- Owner override POST: key, action, reason
- Agent status payload from `/api/status`

## 6. Outputs
- Public HTML pages
- Public config JSON without secrets
- Override audit event
- Approval decision events from the operator desk
- Tier marker in the browser after a success redirect

## 7. APIs Required
- `GET /api/config` public shop settings
- `GET /api/status` agent heartbeat and approval queue
- `POST /api/override` owner brake
- Stripe Payment Links (hosted by Stripe)
- Later: Stripe webhooks, order API from the Sales Agent

## 8. MCP Tools Required
- GitHub push for the repo
- Vercel project link and env var write
- Stripe payment lookup for later reconciliation
- No MCP tool is required for a visitor to use the shop

## 9. Databases Required
- None for this deploy. Browser storage holds the demo pass.
- Next module adds Postgres tables: `orders`, `approvals`, `audit_events`, `tier_grants`.

## 10. Memory Requirements
- No vector memory in the page.
- Governance Agent should remember override reasons.
- Support Agent should remember order notes once the order table exists.

## 11. Security Controls
- Zero-trust: the page is not trusted with the owner key.
- Key compared only in `/api/override`.
- No card data in this app.
- Config endpoint returns links, never secrets.
- Security headers and no-store on APIs.
- Override actions are an allow-list.

## 12. Failure Recovery Strategy
- If `/api/config` fails, pages use built-in demo products.
- If Stripe links are empty, checkout becomes a labeled demo and does not charge.
- If the override key is missing, the API returns 503 and changes nothing.
- Static pages stay up if a function errors.

## 13. Agent-to-Agent Communications
- Storefront publishes `catalog.viewed`, `checkout.clicked`, `approval.decided`, `owner.override`.
- Sales, Support, Governance, and Risk subscribe.
- Transport today: function logs. Next: a queue topic `commerce.events`.

## 14. Workflow Diagram (text)
```
Visitor -> Landing -> Shop -> Stripe Payment Link -> Success URL
Visitor -> Pricing -> Member or Operator link -> Account or Desk
Operator -> Desk -> Approve or send back -> Governance log
Owner -> Override page -> POST /api/override -> allow-list action -> audit log
Agents -> /api/status -> Desk (read only)
```

## 15. Data Flow
Variables in Vercel -> `/api/config` -> HTML.
Stripe hosts payment -> success URL sets a temporary tier.
Override key stays in Vercel -> compared on the server -> JSON result + log line.

## 16. Decision Logic
- Browse: always allowed.
- Orders page: member or operator.
- Approval desk: operator only.
- Owner brake: matching key and action on the allow-list.
- Empty Stripe link: demo pass, clearly labeled.
- Refund over $50 or any contract: wait for operator. Agents may recommend, not execute.

## 17. Escalation Rules
- Failed key check: stop, do not retry in a loop.
- Refund over $50: operator desk.
- New supplier contract: operator desk, then Legal Agent.
- Owner override: Governance Agent and Risk Agent see the log.
- Suspected fraud: freeze refunds, do not email the key.

## 18. KPIs
- Landing to shop click rate
- Shop to checkout click rate
- Paywall view to paid link click
- Approval time on the desk
- Override count per week (should stay near zero)
- Config API error rate

## 19. Logging Requirements
- Override attempts without the key value
- Approval yes / no with id and time
- Config load failures
- Checkout clicks with SKU, not customer card data

## 20. Audit Trail Requirements
- Every override: action, reason, time, result
- Every approval: id, decision, actor tier, time
- Append-only once Postgres lands
- Key values never written

## 21. Compliance Requirements
- Show prices before checkout
- Do not store card numbers
- Privacy note: demo tier is local to the browser
- Refund and contract actions require a person
- Owner is legal owner, not a daily operator

## 22. Future Expansion Ideas
- Stripe webhook that writes a real tier grant
- More than three products from a catalog table
- Email receipt from the Email Agent
- Loyalty balance on the account page

## 23. Risks
- Demo pass is not proof of payment until webhooks exist
- A leaked owner key can pause the shop
- Payment links can drift from displayed prices if variables are edited apart
- Client-side tier can be toggled in the browser; money actions must stay server-checked

## 24. Testing Strategy
- Open `/`, `/shop`, `/how`, `/pricing` with no variables
- Confirm member lock on `/account`
- Confirm operator lock on `/desk`
- POST override with wrong key, then right key
- Paste a Stripe test Payment Link and return through the success URL

## 25. Production Readiness Checklist
- [x] HTML pages for browse, pay, approve, override
- [x] Variables documented
- [x] Secrets kept server-side
- [x] Vercel config present
- [x] Empty links fail safe
- [ ] Stripe live links pasted by owner
- [ ] Webhook confirmation of payment
- [ ] Custom domain

## 26. Suggested Technology Stack
HTML, CSS, small browser JS, Vercel functions, Stripe Payment Links, GitHub. Later: Postgres, a queue, the agent services.

## 27. Cost Estimate
- Vercel hobby: $0 for this size
- Stripe: standard card fees on real charges
- Domain: about $12 a year
- Agent runtime is not in this module

## 28. Deployment Plan
Push `main`. Import in Vercel. Add variables. Redeploy. Set Stripe success URLs to the Vercel domain.

## 29. Maintenance Strategy
Change copy and prices only through variables. Change page structure only with a tested commit. Watch override logs weekly.

## 30. Opportunities for Additional AI Automation
- Sales Agent can draft a fourth product and open a pull request
- Support Agent can pre-fill the refund reason on the desk
- A copy agent can propose a new tagline, held until a preview deploy looks right
