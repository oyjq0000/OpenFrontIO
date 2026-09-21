import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ONLINE_PLAY_URL } from "../../src/client/LocalFork";
import "../../src/client/components/PlayPage";

type PlayPageElement = HTMLElement & { updateComplete: Promise<unknown> };

describe("local game-library home", () => {
  let page: PlayPageElement;

  beforeEach(async () => {
    document.body.innerHTML = "";
    localStorage.clear();
    window.showPage = vi.fn();
    page = document.createElement("play-page") as PlayPageElement;
    document.body.appendChild(page);
    await page.updateComplete;
  });

  afterEach(() => {
    page.remove();
    vi.restoreAllMocks();
  });

  it("routes Play Solo to the existing single-player modal", () => {
    const solo = Array.from(page.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Play Solo",
    );
    expect(solo).toBeDefined();

    solo!.click();

    expect(window.showPage).toHaveBeenCalledWith("page-single-player");
  });

  it("uses a normal safe external CrazyGames link for Play Online", () => {
    const online = Array.from(page.querySelectorAll("a")).find(
      (link) => link.textContent?.trim() === "Play Online",
    ) as HTMLAnchorElement | undefined;

    expect(online?.href).toBe(ONLINE_PLAY_URL);
    expect(online?.target).toBe("_blank");
    expect(online?.rel.split(/\s+/)).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
    expect(page.textContent).toContain(
      "Online multiplayer is provided externally via CrazyGames.",
    );
  });

  it("does not mount official account, shop, ranked, clan or leaderboard controls", () => {
    expect(page.textContent).not.toMatch(
      /sign in|account|shop|ranked|clan|leaderboard/i,
    );
    expect(page.querySelector("nav-account-menu")).toBeNull();
    expect(page.querySelector("steam-wishlist")).toBeNull();
  });
});
