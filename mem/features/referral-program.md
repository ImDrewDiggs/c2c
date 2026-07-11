---
name: Referral Program
description: Give $20, Get $20 credit system. Codes, credits, ledger, and qualification triggers.
type: feature
---
Give $20 (referee welcome credit, applied immediately on signup with valid code) / Get $20 (referrer reward, granted only after referee's first successful paid checkout).

Tables: `referral_codes`, `referrals`, `referral_credits`, `referral_credit_ledger`.
Server functions: `ensure_referral_code(uuid)`, `record_referral(text)` (user-callable), `qualify_referral(uuid)`, `consume_referral_credit(uuid, int)` (service_role only).

Capture points:
- `?ref=CODE` on any register or quote URL is persisted to `localStorage.pending_ref`.
- Redeemed on signup (CustomerRegister) or first login (CustomerLogin) via `record_referral`.
- Instant quote flow forwards `referralCode` into Stripe metadata; `provision-quote` attaches the referral row post-payment.

Qualification runs from `verify-payment` and `provision-quote` on `payment_status=paid`. Idempotent.

Customer page: `/customer/referrals`. Admin BI dashboard not yet built.