import { describe, expect, it, vi } from "vitest";

import type { AudioMixer } from "../../../src/client/sound/AudioMixer";
import { startMenuMusic } from "../../../src/client/sound/MenuMusic";

describe("menu music in the local fork", () => {
  it("is intentionally disabled because the upstream theme is proprietary", () => {
    const listen = vi.spyOn(document, "addEventListener");

    expect(() => startMenuMusic({} as AudioMixer)).not.toThrow();
    expect(listen).not.toHaveBeenCalled();
  });

  it("does not react to later player gestures", () => {
    startMenuMusic({} as AudioMixer);

    expect(() => {
      document.dispatchEvent(new Event("pointerdown"));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    }).not.toThrow();
  });
});
