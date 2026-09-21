import { beforeEach, describe, expect, it } from "vitest";

import "../../../src/client/components/Footer";

type FooterElement = HTMLElement & { updateComplete: Promise<unknown> };

describe("page-footer fork attribution", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  async function mount(): Promise<FooterElement> {
    const footer = document.createElement("page-footer") as FooterElement;
    document.body.appendChild(footer);
    await footer.updateComplete;
    return footer;
  }

  it("preserves the required OpenFront attribution and modified-version notice", async () => {
    const footer = await mount();

    expect(footer.textContent).toContain("Modified version");
    expect(footer.textContent).toContain("© OpenFront and Contributors");
    expect(footer.textContent).toContain("Open assets: CC BY-SA 4.0");
  });

  it("links to attribution and corresponding source without Steam branding", async () => {
    const footer = await mount();
    const links = Array.from(footer.querySelectorAll("a"));

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Attribution",
      "Source Code",
    ]);
    expect(links.every((link) => link.target === "_blank")).toBe(true);
    expect(footer.textContent).not.toMatch(/steam/i);
  });
});
