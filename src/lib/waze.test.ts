import { describe, it, expect } from "vitest";
import { buildWazeAppUrl, buildWazeLiveMapUrl, buildWazeNavigationUrl, CINCINNATI_CENTER } from "./waze";

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

describe("buildWazeAppUrl", () => {
  it("builds a native waze:// deep link with coordinates", () => {
    const url = buildWazeAppUrl({ latitude: 39.1031, longitude: -84.512 });
    expect(url).toBe("waze://?ll=39.103100%2C-84.512000&navigate=yes");
  });

  it("builds a native deep link from an address", () => {
    const url = buildWazeAppUrl({ address: "123 Main St, Cincinnati, OH" });
    expect(url).toContain("waze://?");
    expect(url).toContain("q=123+Main+St%2C+Cincinnati%2C+OH");
    expect(url).toContain("navigate=yes");
  });

  it("returns null with no usable destination", () => {
    expect(buildWazeAppUrl({})).toBeNull();
    expect(buildWazeAppUrl({ latitude: 999, longitude: 0 })).toBeNull();
  });
});

describe("buildWazeLiveMapUrl", () => {
  it("centers the embed on the given location", () => {
    const url = buildWazeLiveMapUrl(CINCINNATI_CENTER, 11);
    expect(url).toContain("lat=39.103100");
    expect(url).toContain("lon=-84.512000");
    expect(url).toContain("zoom=11");
  });

  it("clamps the zoom to the supported range", () => {
    expect(buildWazeLiveMapUrl(CINCINNATI_CENTER, 99)).toContain("zoom=17");
    expect(buildWazeLiveMapUrl(CINCINNATI_CENTER, 1)).toContain("zoom=3");
  });
});
