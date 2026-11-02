import { describe, expect, it } from "vitest";
import { ownsCheckout, trustedReturnOrigin, validSensorKey } from "../../supabase/functions/_shared/securityPolicy";

describe("security boundaries", () => {
  it("does not authorize another customer's checkout", () => {
    expect(ownsCheckout("customer-a", { userId: "customer-b" })).toBe(false);
    expect(ownsCheckout("customer-a", { userId: "customer-a" })).toBe(true);
    expect(ownsCheckout("customer-a", null)).toBe(false);
  });
  it("restricts payment return links to the site's trusted origins", () => {
    expect(trustedReturnOrigin("https://attacker.example")).toBe("https://c2c-site.site");
    expect(trustedReturnOrigin("https://c2c-site.site.attacker.example")).toBe("https://c2c-site.site");
    expect(trustedReturnOrigin("https://c2c.lovable.app")).toBe("https://c2c.lovable.app");
  });
  it("requires the sensor's own nonempty API key", () => {
    expect(validSensorKey(null, "device-secret")).toBe(false);
    expect(validSensorKey("", "")).toBe(false);
    expect(validSensorKey("wrong", "device-secret")).toBe(false);
    expect(validSensorKey("device-secret", "device-secret")).toBe(true);
  });
});