import { describe, it, expect } from "vitest";
import { buildWazeNavigationUrl } from "./waze";

describe("buildWazeNavigationUrl", () => {
  it("uses coordinates when valid", () => {
    const url = buildWazeNavigationUrl({ latitude: 39.1031, longitude: -84.512, address: "x" });
    expect(url).toContain("ll=39.103100%2C-84.512000");
    expect(url).toContain("navigate=yes");
  });

  it("falls back to the address when coordinates are missing", () => {
    const url = buildWazeNavigationUrl({ address: "123 Main St, Cincinnati, OH" });
    expect(url).toContain("q=123+Main+St%2C+Cincinnati%2C+OH");
  });

  it("returns null with no usable destination", () => {
    expect(buildWazeNavigationUrl({ latitude: 0, longitude: 0, address: " " })).toBeNull();
  });
});
