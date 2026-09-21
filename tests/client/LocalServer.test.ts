import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../../src/core/EventBus";
import type { ClientMessage, GameStartInfo } from "../../src/core/Schemas";

vi.mock("src/client/ClientEnv", () => ({
  ClientEnv: {
    turnIntervalMs: vi.fn(() => 100),
    gitCommit: vi.fn(() => "DEV"),
  },
}));

import { LocalServer } from "../../src/client/LocalServer";

const CLIENT_ID = "abCD1234";

function makeGameStartInfo(): GameStartInfo {
  return {
    gameID: "gameID12",
    lobbyCreatedAt: 1000,
    config: {
      gameMap: "Africa",
      difficulty: "Medium",
      donateGold: false,
      donateTroops: false,
      gameType: "Singleplayer",
      gameMode: "Free For All",
      gameMapSize: "Normal",
      nations: "default",
      bots: 400,
      infiniteGold: false,
      infiniteTroops: false,
      instantBuild: false,
      randomSpawn: false,
    },
    players: [
      {
        clientID: CLIENT_ID,
        username: "TestUser",
        clanTag: null,
      },
    ],
  } as GameStartInfo;
}

function makeServer(isReplay = false): LocalServer {
  const server = new LocalServer(
    {
      gameStartInfo: makeGameStartInfo(),
      playerName: "TestUser",
      playerClanTag: null,
    } as any,
    isReplay,
    new EventBus(),
  );
  server.updateCallback(
    () => {},
    () => {},
  );
  return server;
}

const winnerMsg: ClientMessage = {
  type: "winner",
  winner: ["player", CLIENT_ID],
  allPlayersStats: { [CLIENT_ID]: { attacks: [100n] } },
};

describe("LocalServer local-only lifecycle", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("waits for the game client before emitting turn zero", () => {
    vi.useFakeTimers();
    const messages: Array<{ type: string }> = [];
    const server = makeServer();
    server.updateCallback(
      () => {},
      (message) => messages.push(message),
    );

    server.start();
    vi.advanceTimersByTime(500);
    expect(messages.filter((message) => message.type === "turn")).toHaveLength(
      0,
    );

    server.activateTurnLoop();
    vi.advanceTimersByTime(110);
    expect(messages.filter((message) => message.type === "turn")).toHaveLength(
      1,
    );

    server.endGame();
    vi.useRealTimers();
  });

  it("does not upload a single-player record when a winner is declared", async () => {
    const server = makeServer();
    server.start();

    server.onMessage(winnerMsg);
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
    server.endGame();
  });

  it("does not upload on quit/endGame either", async () => {
    const server = makeServer();
    server.start();

    server.endGame();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps replay teardown local as well", async () => {
    const server = makeServer(true);
    server.start();

    server.onMessage(winnerMsg);
    server.endGame();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
