import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { crazyGamesSDK } from "../../src/client/CrazyGamesSDK";
import { setLocalPlayerName } from "../../src/client/LocalFork";
import { SinglePlayerModal } from "../../src/client/SinglePlayerModal";
import { Difficulty, GameMapType, GameType } from "../../src/core/game/Game";

type Internals = {
  startGame(): Promise<void>;
  starting: boolean;
  close(): void;
};

function internals(modal: SinglePlayerModal): Internals {
  return modal as unknown as Internals;
}

describe("SinglePlayerModal local-only start", () => {
  let modal: SinglePlayerModal;
  let joins: CustomEvent[];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    setLocalPlayerName("Local Tester");
    modal = new SinglePlayerModal();
    vi.spyOn(internals(modal), "close").mockImplementation(() => undefined);
    joins = [];
    modal.addEventListener("join-lobby", (event) =>
      joins.push(event as CustomEvent),
    );
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("dispatches the default World/Easy/400-bot game entirely from local state", async () => {
    await internals(modal).startGame();

    expect(joins).toHaveLength(1);
    const start = joins[0].detail.gameStartInfo;
    expect(start.players[0].username).toBe("Local Tester");
    expect(start.players[0].cosmetics).toEqual({});
    expect(start.config.gameType).toBe(GameType.Singleplayer);
    expect(start.config.gameMap).toBe(GameMapType.World);
    expect(start.config.difficulty).toBe(Difficulty.Easy);
    expect(start.config.bots).toBe(400);
    expect(internals(modal).starting).toBe(false);
  });

  it("does not fetch auth, profile, cosmetics or any other API before dispatch", async () => {
    await internals(modal).startGame();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(joins).toHaveLength(1);
  });

  it("does not request a CrazyGames midgame ad", async () => {
    const requestAd = vi
      .spyOn(crazyGamesSDK, "requestMidgameAd")
      .mockResolvedValue(undefined);

    await internals(modal).startGame();

    expect(requestAd).not.toHaveBeenCalled();
  });

  it("does not consult username/account UI during local start", async () => {
    const query = vi.spyOn(document, "querySelector");

    await internals(modal).startGame();

    expect(query).not.toHaveBeenCalledWith("username-input");
    expect(joins).toHaveLength(1);
  });

  it("uses the same local-only path for the tutorial entry", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ nations: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await modal.startTutorial();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/maps/world/manifest.json");
    expect(joins).toHaveLength(1);
    expect(joins[0].detail.gameStartInfo.players[0].username).toBe(
      "Local Tester",
    );
  });
});
