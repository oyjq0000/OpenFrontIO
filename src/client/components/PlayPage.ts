import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  ATTRIBUTION_URL,
  getLocalPlayerName,
  ONLINE_PLAY_URL,
  setLocalPlayerName,
  SOURCE_CODE_URL,
  WORKING_TITLE,
} from "../LocalFork";

@customElement("play-page")
export class PlayPage extends LitElement {
  @state() private playerName = "Player";

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.playerName = getLocalPlayerName();
  }

  private showPage(pageId: string) {
    window.showPage?.(pageId);
  }

  private updatePlayerName(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.playerName = setLocalPlayerName(input.value);
    input.value = this.playerName;
  }

  render() {
    return html`
      <section
        id="page-play"
        class="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-7 px-5 py-10 text-center"
      >
        <button
          id="hamburger-btn"
          class="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-lg text-white lg:hidden"
          aria-label="Open navigation"
          aria-expanded="false"
        >
          ☰
        </button>
        <div class="space-y-3">
          <p
            class="text-xs font-bold uppercase tracking-[0.28em] text-white/45"
          >
            Local single-player edition
          </p>
          <h1 class="text-4xl font-black tracking-tight text-white sm:text-6xl">
            ${WORKING_TITLE}
          </h1>
          <p class="text-sm text-white/60 sm:text-base">
            Based on the open-source OpenFront project. This is a modified,
            unofficial version.
          </p>
        </div>

        <label
          class="flex w-full max-w-sm flex-col gap-2 text-left text-sm text-white/70"
        >
          Player name
          <input
            class="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-sky-400"
            maxlength="20"
            .value=${this.playerName}
            @change=${this.updatePlayerName}
            autocomplete="off"
          />
        </label>

        <div class="grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <button
            class="rounded-xl bg-sky-500 px-6 py-4 text-lg font-black text-white transition hover:bg-sky-400"
            @click=${() => this.showPage("page-single-player")}
          >
            Play Solo
          </button>
          <a
            class="rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-lg font-black text-white transition hover:bg-white/10"
            href=${ONLINE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            >Play Online</a
          >
        </div>

        <p class="max-w-xl text-sm text-white/50">
          Online multiplayer is provided externally via CrazyGames.
        </p>

        <div
          class="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/65"
        >
          <button
            class="hover:text-white"
            @click=${() => this.showPage("page-settings")}
          >
            Settings
          </button>
          <button
            class="hover:text-white"
            @click=${() => this.showPage("page-help")}
          >
            Help / Controls
          </button>
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
      </section>
    `;
  }
}
