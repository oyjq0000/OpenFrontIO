import { beforeEach, describe, expect, it } from "vitest";

import "../../src/client/components/DesktopNavBar";
import "../../src/client/components/MobileNavBar";

type Mountable = HTMLElement & { updateComplete: Promise<unknown> };

async function mount(tag: string): Promise<Mountable> {
  const el = document.createElement(tag) as Mountable;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe("local-only navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("desktop exposes only local play/settings/help plus source", async () => {
    const bar = await mount("desktop-nav-bar");
    const pages = Array.from(
      bar.querySelectorAll<HTMLElement>(".nav-menu-item[data-page]"),
    ).map((el) => el.dataset.page);

    expect(pages).toEqual(["page-play", "page-settings", "page-help"]);
    expect(bar.textContent).toContain("Territory Conquest");
    expect(bar.textContent).not.toMatch(
      /account|store|clan|leaderboard|ranked/i,
    );
  });

  it("mobile exposes the same local-only destinations", async () => {
    const bar = await mount("mobile-nav-bar");
    const pages = Array.from(
      bar.querySelectorAll<HTMLElement>(".nav-menu-item[data-page]"),
    ).map((el) => el.dataset.page);

    expect(pages).toEqual(["page-play", "page-settings", "page-help"]);
    expect(bar.textContent).not.toMatch(
      /account|store|clan|leaderboard|ranked/i,
    );
  });
});
