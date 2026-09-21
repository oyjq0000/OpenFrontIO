import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../../../../src/client/hud/layers/InGamePromo";
import type { InGamePromo } from "../../../../src/client/hud/layers/InGamePromo";

describe("InGamePromo local-only behavior", () => {
  const destroyUnits = vi.fn();
  const spaAddAds = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = "";
    destroyUnits.mockClear();
    spaAddAds.mockClear();
    Object.defineProperty(window, "adsEnabled", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(window, "ramp", {
      configurable: true,
      value: {
        destroyUnits,
        spaAddAds,
        que: { push: vi.fn() },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("remains a renderer placeholder without initializing ad behavior", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const promo = document.createElement("in-game-promo") as InGamePromo;
    document.body.appendChild(promo);
    await promo.updateComplete;

    promo.tick();
    promo.hideAd();
    await promo.updateComplete;

    expect(destroyUnits).not.toHaveBeenCalled();
    expect(spaAddAds).not.toHaveBeenCalled();
    expect(promo.querySelector("#in-game-promo-container")).toBeNull();
    expect(log).not.toHaveBeenCalledWith(
      "[InGamePromo] Spawn phase ended, triggering showAd",
    );
  });
});
