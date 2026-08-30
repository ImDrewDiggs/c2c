# Pricing Breakdown on Quote Confirmation Step

## Goal
Show a complete, itemized monthly price breakdown (plan base, extra cans, recycle add-on, total) on the final "Confirm and pay" step of the Instant Quote Flow.

## Current state
- `src/components/quote/InstantQuoteFlow.tsx` step 4 shows plan name, can count, extra-can cost and recycle cost, but never shows the plan base price — the "Monthly total" has no visible math behind it.
- Step 3 already renders a full breakdown card (base / extra cans / recycle / total) using the shared `calculateQuotePrice` breakdown.

## Changes
1. **`src/components/quote/InstantQuoteFlow.tsx`**
   - Extract the step-3 breakdown card into a small local component (e.g. `PriceBreakdownCard({ breakdown })`) inside the same file to keep it reusable and avoid duplication.
   - Render it on step 3 (unchanged behavior) and on step 4 in place of the ad-hoc "Extra cans / Recycle bin / Monthly total" rows, so the confirmation step shows:
     - `{Plan} base — $XX.XX`
     - `N extra cans × $Y — $ZZ.ZZ` (only when applicable)
     - `Recycle bin — $9.99` (only when it's a paid add-on; Basic plan)
     - `Recycle included` note line (when recycle comes free with the plan, shown as $0.00/"Included" for clarity)
     - `Monthly total — $XX.XX` (bold, existing styling)
   - Keep the summary rows above the breakdown (address, trash day, plan, cans) untouched.
   - No pricing logic changes — everything reads from the existing `calculateQuotePrice` result, which stays in sync with the server-side copy in `supabase/functions/_shared/quotePricing.ts`.

## Verification
- `bunx tsgo` typecheck passes.
- Playwright: walk the quote flow to step 4 with Premium + 4 cans ($79.99 + 2×$10 = $99.99) and confirm the breakdown rows and total display correctly; repeat with Basic + recycle ($24.99 + $9.99 = $34.98).
