/**
 * Authoritative subscription pricing (server).
 * Mirrored for display only in src/lib/subscriptionPricing.ts — keep both in sync.
 */

export type SubscriptionType = "single-family" | "multi-family";

export interface PlanOption {
  id: string;
  name: string;
  price: number;
}

export interface AddOnOption {
  name: string;
  price: number;
}

export const SINGLE_FAMILY_PLANS: PlanOption[] = [
  { id: "basic", name: "Basic", price: 24.99 },
  { id: "standard", name: "Standard", price: 49.99 },
  { id: "premium", name: "Premium", price: 79.99 },
  { id: "comprehensive", name: "Comprehensive", price: 119.99 },
  { id: "elite", name: "ELITE", price: 169.99 },
];

/** Multi-family service levels are priced per unit, per month. */
export const MULTI_FAMILY_LEVELS: PlanOption[] = [
  { id: "mf-basic", name: "Basic", price: 9.99 },
  { id: "mf-standard", name: "Standard", price: 12.99 },
  { id: "mf-premium", name: "Premium", price: 18.99 },
  { id: "mf-comprehensive", name: "Comprehensive", price: 24.99 },
  { id: "mf-elite", name: "ELITE", price: 32.99 },
];

export const ADD_ONS: AddOnOption[] = [
  { name: "Extra Can Concierge", price: 9.99 },
  { name: "Extra Can Cleaning", price: 14.99 },
  { name: "Priority Same-Day Pickup", price: 49.99 },
  { name: "Bulk Item Removal", price: 45 },
  { name: "Yard Pickup (ELITE only)", price: 25 },
];

export const CONTRACT_OPTIONS = [1, 6, 12] as const;
export type ContractMonths = (typeof CONTRACT_OPTIONS)[number];

export const TAX_RATE = 0.08;
export const MIN_MULTI_FAMILY_UNITS = 11;
export const MAX_MULTI_FAMILY_UNITS = 5000;
/** Second add-on is 25% off when two or more add-ons are selected. */
export const SECOND_ADD_ON_DISCOUNT = 0.25;

export interface SubscriptionQuoteInput {
  subscriptionType: SubscriptionType;
  /** Single-family plan ids, or a single multi-family level id. */
  planIds: string[];
  addOnNames: string[];
  unitCount: number;
  contractMonths: number;
}

export interface QuoteLine {
  label: string;
  amount: number;
  note?: string;
}

export interface SubscriptionQuote {
  lines: QuoteLine[];
  monthlySubtotal: number;
  discountRate: number;
  discountedMonthly: number;
  months: ContractMonths;
  subtotal: number;
  tax: number;
  total: number;
  planNames: string[];
  unitCount: number;
  valid: boolean;
  reason?: string;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function getContractDiscountRate(months: number): number {
  if (months === 12) return 0.1;
  if (months === 6) return 0.05;
  return 0;
}

export function normalizeContractMonths(months: unknown): ContractMonths {
  const parsed = Number(months);
  return (CONTRACT_OPTIONS as readonly number[]).includes(parsed)
    ? (parsed as ContractMonths)
    : 1;
}

export function computeSubscriptionQuote(input: SubscriptionQuoteInput): SubscriptionQuote {
  const months = normalizeContractMonths(input.contractMonths);
  const discountRate = getContractDiscountRate(months);
  const planIds = Array.isArray(input.planIds) ? input.planIds : [];
  const addOnNames = Array.isArray(input.addOnNames) ? input.addOnNames : [];
  const lines: QuoteLine[] = [];
  const planNames: string[] = [];

  let unitCount = 1;
  let planMonthly = 0;
  let valid = true;
  let reason: string | undefined;

  if (input.subscriptionType === "single-family") {
    const plans = planIds
      .map((id) => SINGLE_FAMILY_PLANS.find((plan) => plan.id === id))
      .filter((plan): plan is PlanOption => Boolean(plan));

    if (plans.length === 0 || plans.length !== planIds.length) {
      valid = false;
      reason = "Select at least one valid service plan.";
    }

    for (const plan of plans) {
      planMonthly += plan.price;
      planNames.push(plan.name);
      lines.push({ label: `${plan.name} Plan`, amount: round(plan.price) });
    }
  } else if (input.subscriptionType === "multi-family") {
    unitCount = Math.floor(Number(input.unitCount) || 0);
    const level = MULTI_FAMILY_LEVELS.find((option) => option.id === planIds[0]);

    if (!level || planIds.length !== 1) {
      valid = false;
      reason = "Select a multi-family service level.";
    } else if (unitCount < MIN_MULTI_FAMILY_UNITS || unitCount > MAX_MULTI_FAMILY_UNITS) {
      valid = false;
      reason = `Unit count must be between ${MIN_MULTI_FAMILY_UNITS} and ${MAX_MULTI_FAMILY_UNITS}.`;
    } else {
      planMonthly = level.price * unitCount;
      planNames.push(`${level.name} Multi-Family`);
      lines.push({
        label: `${level.name} Multi-Family (${unitCount} units)`,
        amount: round(planMonthly),
        note: `$${level.price.toFixed(2)} per unit / month`,
      });
    }
  } else {
    valid = false;
    reason = "Unsupported subscription type.";
  }

  let addOnMonthly = 0;
  addOnNames.forEach((name, index) => {
    const addOn = ADD_ONS.find((option) => option.name === name);
    if (!addOn) {
      valid = false;
      reason = "Unknown add-on selected.";
      return;
    }
    const discounted = index === 1 && addOnNames.length >= 2;
    const price = round(discounted ? addOn.price * (1 - SECOND_ADD_ON_DISCOUNT) : addOn.price);
    addOnMonthly += price;
    lines.push({
      label: addOn.name,
      amount: price,
      note: discounted ? "25% off 2nd add-on" : undefined,
    });
  });

  const monthlySubtotal = round(planMonthly + addOnMonthly);
  const discountedMonthly = round(monthlySubtotal * (1 - discountRate));
  const subtotal = round(discountedMonthly * months);
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + tax);

  return {
    lines,
    monthlySubtotal,
    discountRate,
    discountedMonthly,
    months,
    subtotal,
    tax,
    total,
    planNames,
    unitCount,
    valid: valid && monthlySubtotal > 0,
    reason: monthlySubtotal > 0 ? reason : reason ?? "Nothing selected.",
  };
}

export function contractLabel(months: number): string {
  if (months === 12) return "12-month";
  if (months === 6) return "6-month";
  return "monthly";
}
