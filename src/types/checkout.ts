import type { SubscriptionType } from "@/lib/subscriptionPricing";

/** Data handed from the subscription page to the checkout page via router state. */
export interface CheckoutData {
  subscriptionType: SubscriptionType;
  /** Single-family plan ids, or a single multi-family service level id. */
  planIds: string[];
  addOnNames: string[];
  unitCount: number;
  contractMonths: number;
}

/** Payload sent to the create-checkout-session edge function. */
export interface CreateCheckoutSessionPayload extends CheckoutData {
  /** Client-computed total (incl. tax). Server recomputes and rejects mismatches. */
  total: number;
}

export function isCheckoutData(value: unknown): value is CheckoutData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<CheckoutData>;
  return (
    (data.subscriptionType === "single-family" || data.subscriptionType === "multi-family") &&
    Array.isArray(data.planIds) &&
    data.planIds.every((id) => typeof id === "string") &&
    Array.isArray(data.addOnNames) &&
    data.addOnNames.every((name) => typeof name === "string") &&
    typeof data.unitCount === "number" &&
    typeof data.contractMonths === "number"
  );
}
