import type { LitElement } from "lit";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { DesktopNavBar } from "../../src/client/components/DesktopNavBar";
import { MobileNavBar } from "../../src/client/components/MobileNavBar";
import { PlayPage } from "../../src/client/components/PlayPage";

async function mount<T extends LitElement>(element: T): Promise<T> {
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => document.body.replaceChildren());

describe("Inventory is disabled in the local-only product shell", () => {
  it("does not render Inventory in desktop or mobile navigation", async () => {
    const desktop = await mount(new DesktopNavBar());
    const mobile = await mount(new MobileNavBar());

    expect(desktop.querySelector('[data-page="page-inventory"]')).toBeNull();
    expect(mobile.querySelector('[data-page="page-inventory"]')).toBeNull();
  });

  it("keeps account/cosmetic selectors off the local home page", async () => {
    const play = await mount(new PlayPage());

    expect(play.querySelector("cosmetics-input")).toBeNull();
    expect(play.querySelector("flag-input")).toBeNull();
    expect(play.querySelector("username-input")).toBeNull();
    expect(play.querySelector("nav-account-menu")).toBeNull();
  });

  it("does not mount the routed Inventory page in index.html", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "index.html"),
      "utf8",
    );

    expect(source).not.toContain('id="page-inventory"');
    expect(source).not.toContain("<inventory-modal");
    expect(source).not.toContain("<cosmetics-modal");
    expect(source).not.toContain("<flag-input-modal");
  });
});
