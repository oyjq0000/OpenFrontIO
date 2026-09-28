import { describe, expect, it } from "vitest";
import { deriveHomeHref } from "../../src/client/Utils";

describe("deriveHomeHref", () => {
  it("keeps standalone root builds on the site root", () => {
    expect(deriveHomeHref("/", undefined, "openfront.local")).toBe("/");
  });

  it("keeps game-library builds inside their reviewed subpath", () => {
    expect(deriveHomeHref("/games/realmspan/", undefined, "questhub.uk")).toBe(
      "/games/realmspan/",
    );
  });

  it("prefers the game-library subpath over an injected site host", () => {
    expect(
      deriveHomeHref("/games/realmspan/", "openfront.io", "questhub.uk"),
    ).toBe("/games/realmspan/");
  });

  it("preserves apex routing for regular root deployments", () => {
    expect(deriveHomeHref("/", "openfront.io", "blue.openfront.io")).toBe(
      "https://openfront.io/",
    );
  });

  it("keeps the plain root when already on the configured site host", () => {
    expect(deriveHomeHref("/", "openfront.io", "openfront.io")).toBe("/");
  });
});
