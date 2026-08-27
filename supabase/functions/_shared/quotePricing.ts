/**
 * Authoritative instant-quote plan pricing (server).
 * Mirrored for display only in src/lib/quotePricing.ts — keep both in sync.
 */

export interface QuotePlan {
  id: string;
  name: string;
  basePrice: number;
  includedCans: number;
  recycleIncluded: boolean;
  recycleAddOn: number;
  extraCanPrice: number;
}

export const QUOTE_PLANS: QuotePlan[] = [
  { id: "basic", name: "Basic", basePrice: 24.99, includedCans: 1, recycleIncluded: false, recycleAddOn: 9.99, extraCanPrice: 12 },
  { id: "standard", name: "Standard", basePrice: 49.99, includedCans: 1, recycleIncluded: true, recycleAddOn: 0, extraCanPrice: 11 },
  { id: "premium", name: "Premium", basePrice: 79.99, includedCans: 2, recycleIncluded: true, recycleAddOn: 0, extraCanPrice: 10 },
  { id: "comprehensive", name: "Comprehensive", basePrice: 119.99, includedCans: 3, recycleIncluded: true, recycleAddOn: 0, extraCanPrice: 9 },
  { id: "elite", name: "ELITE", basePrice: 169.99, includedCans: 3, recycleIncluded: true, recycleAddOn: 0, extraCanPrice: 8 },
];

export const MAX_CANS = 10;

export function getQuotePlan(id: unknown): QuotePlan {
  const found = typeof id === "string" ? QUOTE_PLANS.find((p) => p.id === id.toLowerCase()) : undefined;
  return found ?? QUOTE_PLANS[0];
}

export function calculateQuotePrice(planId: unknown, cans: unknown, recycle: boolean) {
  const plan = getQuotePlan(planId);
  const safeCans = Math.max(1, Math.min(MAX_CANS, Math.floor(Number(cans) || 1)));
  const extraCans = Math.max(0, safeCans - plan.includedCans);
  const extraCansCost = Number((extraCans * plan.extraCanPrice).toFixed(2));
  const recycleCost = recycle && !plan.recycleIncluded ? plan.recycleAddOn : 0;
  const total = Number((plan.basePrice + extraCansCost + recycleCost).toFixed(2));
  return { plan, cans: safeCans, extraCans, extraCansCost, recycleCost, total };
}
