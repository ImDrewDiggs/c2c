
## New pricing guide (Sep 2026)
- [ ] Single-family tiers: Basic 24.99, Standard 49.99, Premium 79.99, Comprehensive 119.99, Premiere 169.99
- [ ] Tier add-on discounts: Basic 0%, Standard 5%, Premium 7%, Comprehensive 10%, Premiere 10%
- [ ] Multi-family per-unit: 9.99 / 12.99 / 18.99 / 24.99 / 32.99
- [ ] Add-ons: Extra Can Concierge 9.99, Extra Can Cleaning 14.99, Priority Same-Day 49.99, Bulk Item Removal 45, Yard Pickup 25 (Premiere only)
- [ ] Business flat-rate services list (grease hood, cardboard, pressure washing, exterior wash)
- [ ] Sync tier feature bullets in src/data/services.ts with the guide

## Open
- [x] Fix employee clock in/out (TimeTracker) — location capture no longer blocks, buttons show state

## Audit fixes (Nov 2026)
- [ ] Ordered deep-scan fixes: checkout ownership, email delivery, sensor authentication, NDA ownership, private role checks, trusted return links, private logs, safe exports
- [x] Security log inserts limited to caller's own user id
- [x] Services list limited to active services for signed-in users
- [x] Chat helper no longer reveals prices (NDA) or fake phone numbers
- [x] Admin Customers shows real customers; search input sanitized
- [x] Testimonials: removed broken video placeholders
- [x] Schedule page saves, lists and cancels real appointments
- [x] Removed unused duplicate fleet page
- [x] Hardcoded colors replaced with theme tokens (added warning/info tokens)
- [ ] Leaked-password protection + 10-min OTP expiry — needs Supabase dashboard (user)
- [ ] Postgres upgrade — needs Supabase dashboard (user)
- [ ] Google Search Console verification — needs publish + verify (user)
- [ ] Loose types cleanup, bundle size reduction

## Waze setup (Nov 2026)
- [x] Native waze:// deep link with web fallback for drivers on the mobile app
- [x] Navigate button opens Waze app on phones, Waze website on desktop
- [x] Admin Live Traffic map centers on the viewer location (Cincinnati fallback)
- [x] Waze link tests (app URL, live map URL, zoom clamping)
