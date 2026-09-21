import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HelpModal, shouldRenderHelpVideo } from "../../src/client/HelpModal";

describe("HelpModal local edition", () => {
  let modal: HelpModal;

  beforeEach(async () => {
    document.body.innerHTML = "";
    modal = document.createElement("help-modal") as HelpModal;
    document.body.appendChild(modal);
    modal.open();
    await modal.updateComplete;
  });

  afterEach(() => {
    modal.remove();
  });

  it("does not render the remote tutorial video section in the local fork", () => {
    expect(modal.querySelector("#tutorial-video-iframe")).toBeNull();
    expect(modal.querySelector("#tutorial-video-player")).toBeNull();
  });

  it("keeps the non-local video path available for the upstream UI", () => {
    expect(shouldRenderHelpVideo(true)).toBe(false);
    expect(shouldRenderHelpVideo(false)).toBe(true);
  });
});
