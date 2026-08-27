/**
 * Instant-quote plan pricing (client mirror).
 * The edge function `instant-quote-checkout` holds the authoritative copy —
 * keep both files in sync. This is used for display and validation only.
 */

export interface QuotePlan {
  id: QuotePlanId;
  name: string;
  /** Monthly base price in USD. */
  basePrice: number;
  /** Trash cans included in the base price. */
  includedCans: number;
  /** Whether a recycle bin is already part of the plan. */
  recycleIncluded: boolean;
  /** Monthly add-on cost when recycle is not included. */
  recycleAddOn: number;
  /** Monthly cost for each trash can beyond `includedCans`. */
  extraCanPrice: number;
  highlights: string[];
}

export type QuotePlanId =
  | "basic"
  | "standard"
  | "premium"
  | "comprehensive"
  | "elite";

export const QUOTE_PLANS: readonly QuotePlan[] = [
  {
    id: "basic",
    name: "Basic",
    basePrice: 24.99,
    includedCans: 1,
    recycleIncluded: false,
    recycleAddOn: 9.99,
    extraCanPrice: 12,
    highlights: ["1 trash can concierge (same day)", "Curb out & back in"],
  },
  {
    id: "standard",
    name: "Standard",
    basePrice: 49.99,
    includedCans: 1,
    recycleIncluded: true,
    recycleAddOn: 0,
    extraCanPrice: 11,
    highlights: ["1 trash can + recycle", "Monthly can cleaning", "5% off add-ons"],
  },
  {
    id: "premium",
    name: "Premium",
    basePrice: 79.99,
    includedCans: 2,
    recycleIncluded: true,
    recycleAddOn: 0,
    extraCanPrice: 10,
    highlights: ["2 trash cans + recycle", "Bi-weekly can cleaning", "Monthly large item pickup"],
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    basePrice: 119.99,
    includedCans: 3,
    recycleIncluded: true,
    recycleAddOn: 0,
    extraCanPrice: 9,
    highlights: ["3 trash cans + recycle", "Weekly cleaning & deodorizing", "Trash area cleanup"],
  },
  {
    id: "elite",
    name: "ELITE",
    basePrice: 169.99,
    includedCans: 3,
    recycleIncluded: true,
    recycleAddOn: 0,
    extraCanPrice: 8,
    highlights: ["All Comprehensive services", "Weekly hazardous & large item", "Priority account manager"],
  },
] as const;

export const MAX_CANS = 10;

export const getQuotePlan = (id: string): QuotePlan =>
  QUOTE_PLANS.find((p) => p.id === id) ?? QUOTE_PLANS[0];

export interface QuotePriceBreakdown {
  plan: QuotePlan;
  cans: number;
  extraCans: number;
  extraCansCost: number;
  recycleCost: number;
  total: number;
}

export function calculateQuotePrice(
  planId: string,
  cans: number,
  recycle: boolean,
): QuotePriceBreakdown {
  const plan = getQuotePlan(planId);
  const safeCans = Math.max(1, Math.min(MAX_CANS, Math.floor(Number(cans) || 1)));
  const extraCans = Math.max(0, safeCans - plan.includedCans);
  const extraCansCost = Number((extraCans * plan.extraCanPrice).toFixed(2));
  const recycleCost = recycle && !plan.recycleIncluded ? plan.recycleAddOn : 0;
  const total = Number((plan.basePrice + extraCansCost + recycleCost).toFixed(2));
  return { plan, cans: safeCans, extraCans, extraCansCost, recycleCost, total };
}
