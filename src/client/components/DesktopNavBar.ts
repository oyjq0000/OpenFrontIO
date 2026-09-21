import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { SOURCE_CODE_URL, WORKING_TITLE } from "../LocalFork";

@customElement("desktop-nav-bar")
export class DesktopNavBar extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <nav
        class="hidden lg:flex w-full bg-zinc-900/90 backdrop-blur-md items-center justify-center gap-8 py-4 shrink-0 z-50 relative"
      >
        <div class="font-black tracking-wide text-white">${WORKING_TITLE}</div>
        <button
          class="nav-menu-item text-white/70 hover:text-sky-400"
          data-page="page-play"
        >
          Play
        </button>
        <button
          class="nav-menu-item text-white/70 hover:text-sky-400"
          data-page="page-settings"
        >
          Settings
        </button>
        <button
          class="nav-menu-item text-white/70 hover:text-sky-400"
          data-page="page-help"
        >
          Help / Controls
        </button>
        <a
          class="text-white/70 hover:text-sky-400"
          href=${SOURCE_CODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          >Source</a
        >
      </nav>
    `;
  }
}
