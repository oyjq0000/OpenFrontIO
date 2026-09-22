import { beforeEach, describe, expect, it } from "vitest";
import {
  getLocalPlayerName,
  setLocalPlayerName,
} from "../../src/client/LocalFork";

describe("Realmspan local player name storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the player name under the Realmspan namespace", () => {
    expect(setLocalPlayerName("Alice")).toBe("Alice");
    expect(window.localStorage.getItem("realmspan.player-name")).toBe("Alice");
    expect(
      window.localStorage.getItem("territory-conquest.player-name"),
    ).toBeNull();
  });

  it("migrates the working-title key without clearing unrelated storage", () => {
    window.localStorage.setItem("territory-conquest.player-name", " Legacy ");
    window.localStorage.setItem("other-game.settings", "keep");

    expect(getLocalPlayerName()).toBe("Legacy");
    expect(window.localStorage.getItem("realmspan.player-name")).toBe("Legacy");
    expect(
      window.localStorage.getItem("territory-conquest.player-name"),
    ).toBeNull();
    expect(window.localStorage.getItem("other-game.settings")).toBe("keep");
  });
});
