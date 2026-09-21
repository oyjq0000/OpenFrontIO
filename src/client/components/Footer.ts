import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import {
  attributionUrl,
  licensesUrl,
  sourceCodeUrl,
  sourceRevisionLabel,
  UPSTREAM_BASELINE_SHA,
  upstreamBaselineUrl,
} from "../LocalFork";

@customElement("page-footer")
export class Footer extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    const attribution = attributionUrl();
    const license = licensesUrl();
    const source = sourceCodeUrl();
    const upstream = upstreamBaselineUrl();

    return html`
      <footer
        class="[.in-game_&]:hidden bg-zinc-900/90 border-t border-white/10 px-4 py-4 text-center text-xs text-white/50"
      >
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>Modified version · © OpenFront and Contributors</span>
          <span>OpenFront assets: CC BY-SA 4.0 · fonts: OFL / CC0</span>
          <a
            class="hover:text-white"
            href=${attribution}
            target="_blank"
            rel="noopener noreferrer"
            >Attribution</a
          >
          <a
            class="hover:text-white"
            href=${source}
            target="_blank"
            rel="noopener noreferrer"
            >Source Code</a
          >
          <a
            class="hover:text-white"
            href=${license}
            target="_blank"
            rel="noopener noreferrer"
            >Licenses</a
          >
          <a
            class="hover:text-white"
            href=${upstream}
            target="_blank"
            rel="noopener noreferrer"
          >
            Upstream ${UPSTREAM_BASELINE_SHA.slice(0, 12)}
          </a>
          <span>Build ${sourceRevisionLabel()}</span>
        </div>
      </footer>
    `;
  }
}
