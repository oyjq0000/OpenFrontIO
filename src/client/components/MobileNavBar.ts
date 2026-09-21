import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { sourceCodeUrl, WORKING_TITLE } from "../LocalFork";

const ITEM =
  "nav-menu-item block w-full text-left text-lg font-bold text-white/75 hover:text-sky-400 py-3";

@customElement("mobile-nav-bar")
export class MobileNavBar extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex h-full w-full flex-col gap-2 overflow-y-auto p-6">
        <div class="mb-6 text-xl font-black text-white">${WORKING_TITLE}</div>
        <button class=${ITEM} data-page="page-play">Play</button>
        <button class=${ITEM} data-page="page-settings">Settings</button>
        <button class=${ITEM} data-page="page-help">Help / Controls</button>
        <a
          class=${ITEM}
          href=${sourceCodeUrl()}
          target="_blank"
          rel="noopener noreferrer"
          >Source Code</a
        >
      </div>
    `;
  }
}
