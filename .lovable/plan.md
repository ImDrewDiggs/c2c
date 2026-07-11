
# What's Missing — Gap Analysis

Based on the current state of Can2Curb (trash concierge + cleaning platform for Cincinnati), here are the meaningful gaps I see, grouped by impact. Pick any combination and I'll build them.

## 1. Revenue-critical gaps (fix first)

- **Stripe webhook secret not configured** — payments work, but `orders`/`subscribers`/`payments` tables won't auto-sync on successful checkout. Right now you're relying on `verify-payment` being called from the success page, which misses failed redirects, refunds, disputes, cancellations, and renewals.
- **No referral / affiliate system** — highest-ROI growth channel for local service businesses ("Give $20, Get $20"). Missing entirely.
- **No abandoned-quote recovery** — the InstantQuoteFlow captures address + service details but doesn't save partial quotes or email/SMS a recovery link.
- **No annual prepay discount surfacing** — subscription billing rules exist in memory (1/6/12 mo discounts) but the quote flow only sells monthly.
- **No upsell after checkout** — success page just confirms, doesn't offer add-ons (bulk pickup, deep clean, extra can, holiday service).

## 2. Operational gaps (you'll hit these in week 1 of real customers)

- **No customer-facing service calendar** — customer dashboard shows subscriptions but no "your next 4 pickups" view with skip/reschedule buttons.
- **No "skip a week" / vacation hold** — table + UI + credit logic missing. This is the #1 support ticket for concierge services.
- **No proof-of-service delivery** — employees can upload photos, but customers never see them. No auto-email "your cans were serviced today [photo]".
- **No SMS notifications** — only in-app. Trash service customers overwhelmingly want text reminders ("cans out tonight", "serviced today").
- **No route sheet / driver mobile view** — employee dashboard exists but I don't see an optimized "today's stops in order with nav links" screen for the field.
- **No customer complaint / redo request flow** — support tickets exist but no structured "missed pickup → auto-schedule redo → credit" workflow.

## 3. Growth & retention gaps

- **No email marketing integration** — no welcome series, no win-back for cancelled, no seasonal promos. Resend or similar not wired up.
- **No review-generation flow** — after N successful services, auto-ask for a Google review (huge for local SEO).
- **No neighborhood referral map** — "3 of your neighbors already subscribe" social proof on the quote page by ZIP.
- **Blog / content hub missing** — you have SEO landing pages but no `/blog` for ranking on long-tail queries ("how often should I clean my trash can", etc.).
- **Gift subscriptions** — common for senior parents; missing.

## 4. Trust & conversion gaps

- **No real testimonials with photos/names/neighborhoods** — Testimonials page uses generic content.
- **No service-area map** — visitors from outside Cincinnati can't self-qualify; you're wasting quote attempts.
- **No live chat or scheduled callback** — ChatBot component exists but I'd verify it's connected to a real backend / human handoff.
- **No pricing transparency page** — pricing is behind NDA/terms gate. That protects competitive info but tanks conversion vs. competitors who show prices.
- **No FAQ schema on FAQ page** — wait, this is done. Skip.
- **No trust badges: insured / bonded / BBB / satisfaction guarantee** — TrustStrip exists but I'd audit what's on it.

## 5. Admin & business-intelligence gaps

- **No churn dashboard** — no MRR, churn %, LTV, CAC anywhere in admin analytics.
- **No cohort retention view** — critical for a subscription business.
- **No route profitability report** — which ZIPs/routes lose money.
- **No employee performance scorecards** — completions/hour, complaint rate, on-time %.
- **No automated invoicing for HOA / commercial** — HOA landing page exists but no B2B invoice flow (net-30, PO numbers, multi-property billing).

## 6. Technical / platform gaps

- **Stripe webhook** (repeat — it belongs here too).
- **No email deliverability setup** — no custom domain for transactional email = magic links land in spam.
- **PWA / installability** — you have Capacitor for native but no PWA manifest for "add to home screen" on the web.
- **No error monitoring beyond diagnostics panel** — Sentry or equivalent for production error tracking with alerting.
- **No uptime monitoring / status page**.
- **No automated database backups verification** — Supabase does backups; no restore drill documented.
- **No rate limiting on quote endpoint** — someone can spam `instant-quote-checkout` and rack up Stripe API cost.
- **Accessibility audit not done** — no lighthouse-a11y CI gate.

## My recommendation — top 5 to build next, in order

1. **Stripe webhook** (15 min once you paste the secret) — closes the payment loop.
2. **Customer service calendar + skip-a-week + vacation hold** — kills the biggest support-ticket category.
3. **SMS notifications + service-completion photo email** — the single biggest driver of retention and reviews for this industry.
4. **Referral program** ($20/$20) — cheapest acquisition channel you'll ever have.
5. **Churn / MRR / LTV admin dashboard** — you can't improve what you don't measure.

## What I need from you

Tell me which of these to build (numbers, names, or "top 5"), and for anything ambiguous I'll ask one follow-up before starting.
