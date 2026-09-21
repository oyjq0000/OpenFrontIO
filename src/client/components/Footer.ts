import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { ATTRIBUTION_URL, SOURCE_CODE_URL } from "../LocalFork";

@customElement("page-footer")
export class Footer extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <footer
        class="[.in-game_&]:hidden bg-zinc-900/90 border-t border-white/10 px-4 py-4 text-center text-xs text-white/50"
      >
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>Modified version · © OpenFront and Contributors</span>
          <span>Open assets: CC BY-SA 4.0</span>
          <a
            class="hover:text-white"
            href=${ATTRIBUTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            >Attribution</a
          >
          <a
            class="hover:text-white"
            href=${SOURCE_CODE_URL}
            target="_blank"
            rel="noopener noreferrer"
            >Source Code</a
          >
        </div>
      </footer>
    `;
  }
}
