import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameStartingModal } from "../../src/client/GameStartingModal";
import {
  LOCAL_JOIN_FAILED_MESSAGE,
  recoverLocalJoinUi,
} from "../../src/client/LocalJoinRecovery";
import "../../src/client/components/PlayPage";

type PlayPageElement = HTMLElement & { updateComplete: Promise<unknown> };

describe("local join failure recovery", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    history.replaceState(null, "", "/?starting=1");
    window.showPage = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    history.replaceState(null, "", "/");
  });

  it("consumes the rejection, hides the overlay, returns home and allows retry", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const unhandled = vi.fn();
    window.addEventListener("unhandledrejection", unhandled);

    const overlay = document.createElement(
      "game-starting-modal",
    ) as GameStartingModal;
    document.body.appendChild(overlay);
    overlay.show();
    await overlay.updateComplete;

    let message: CustomEvent | undefined;
    window.addEventListener(
      "show-message",
      (event) => {
        message = event as CustomEvent;
      },
      { once: true },
    );

    await expect(
      Promise.reject(new Error("local join failed")).catch((error) => {
        recoverLocalJoinUi(error);
      }),
    ).resolves.toBeUndefined();
    await overlay.updateComplete;
    await Promise.resolve();

    expect(consoleError).toHaveBeenCalled();
    expect(unhandled).not.toHaveBeenCalled();
    expect(overlay.isVisible).toBe(false);
    expect(location.pathname).toBe("/");
    expect(window.showPage).toHaveBeenCalledWith("page-play");
    expect(message?.detail).toMatchObject({
      message: LOCAL_JOIN_FAILED_MESSAGE,
      color: "red",
    });

    const page = document.createElement("play-page") as PlayPageElement;
    document.body.appendChild(page);
    await page.updateComplete;
    const playSolo = Array.from(page.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Play Solo",
    );
    playSolo?.click();
    expect(window.showPage).toHaveBeenLastCalledWith("page-single-player");

    window.removeEventListener("unhandledrejection", unhandled);
  });
});
