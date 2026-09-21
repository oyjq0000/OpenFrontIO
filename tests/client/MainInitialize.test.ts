import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { LOCAL_ONLY_FORK } from "../../src/client/LocalFork";

const mainSource = fs.readFileSync(
  path.join(process.cwd(), "src/client/Main.ts"),
  "utf8",
);
const indexSource = fs.readFileSync(
  path.join(process.cwd(), "index.html"),
  "utf8",
);

describe("local-only Main bootstrap", () => {
  it("enables the fork guard", () => {
    expect(LOCAL_ONLY_FORK).toBe(true);
  });

  it("returns into initializeLocalFork before official startup services", () => {
    const guard = mainSource.indexOf(
      "if (LOCAL_ONLY_FORK) {\n      this.initializeLocalFork();\n      return;",
    );
    expect(guard).toBeGreaterThan(-1);

    for (const marker of [
      "startServerListPolling();",
      "void prefetchTurnstileToken();",
      "void this.userAuth();",
      "this.storeModal.refresh()",
      "crazyGamesSDK.maybeInit()",
    ]) {
      const position = mainSource.indexOf(marker);
      if (position >= 0) expect(guard).toBeLessThan(position);
    }
  });

  it("registers only the local settings/help/single-player support routes", () => {
    const start = mainSource.indexOf("private initializeLocalFork");
    const end = mainSource.indexOf("async initialize()", start);
    const localBlock = mainSource.slice(start, end);

    expect(localBlock).toContain('"single-player"');
    expect(localBlock).toContain('"settings"');
    expect(localBlock).toContain('"help"');
    expect(localBlock).not.toMatch(
      /inventory|store|leaderboard|ranked|clan|account/,
    );
  });

  it("recovers local join failures without rethrowing an unhandled rejection", () => {
    const start = mainSource.indexOf("private initializeLocalFork");
    const end = mainSource.indexOf("async initialize()", start);
    const localBlock = mainSource.slice(start, end);

    expect(localBlock).toContain("recoverLocalJoinUi(error);");
    expect(localBlock).toContain("this.joinInFlight = false;");
    expect(localBlock).not.toContain("throw error;");
  });

  it("does not rewrite single-player games to multiplayer-style routes", () => {
    expect(mainSource).toContain(
      'if (lobby.source !== "public" && !isSingleplayer) {',
    );

    const joinResolved = mainSource.indexOf("this.lobbyHandle.join.then");
    const nextMethod = mainSource.indexOf("private emitPresence", joinResolved);
    const resolvedBlock = mainSource.slice(joinResolved, nextMethod);
    expect(resolvedBlock).toContain("if (!isSingleplayer) {");
    expect(resolvedBlock).toContain("ClientEnv.gamePath(lobby.gameID)");
  });

  it("restores the home pathname on quit", () => {
    const leaveStart = mainSource.indexOf("private async handleLeaveLobby");
    const leaveEnd = mainSource.indexOf(
      "private handleMatchmakingRequeue",
      leaveStart,
    );
    const leaveBlock = mainSource.slice(leaveStart, leaveEnd);

    expect(leaveBlock).toContain('history.replaceState(null, "", "/");');
    expect(leaveBlock).toContain("if (leavingLocalSingleplayer) {");
    expect(leaveBlock).toContain('window.showPage?.("page-play");');
  });

  it("does not load official SDK, auth challenge, ads or telemetry scripts", () => {
    expect(indexSource).not.toMatch(/sdk\.crazygames\.com/i);
    expect(indexSource).not.toMatch(/challenges\.cloudflare\.com/i);
    expect(indexSource).not.toMatch(
      /googletagmanager|cloudflareinsights|intergient/i,
    );
  });

  it("mounts the local product pages instead of official online product pages", () => {
    expect(indexSource).toContain('id="page-single-player"');
    expect(indexSource).toContain('id="page-settings"');
    expect(indexSource).toContain('id="page-help"');

    for (const page of [
      "page-store",
      "page-account",
      "page-inventory",
      "page-clan",
      "page-leaderboard",
      "page-ranked",
      "page-matchmaking",
    ]) {
      expect(indexSource).not.toContain(`id="${page}"`);
    }
  });
});
