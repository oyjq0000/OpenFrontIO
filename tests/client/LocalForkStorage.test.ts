import { describe, expect, it } from "vitest";
import {
  createRealmspanScopedStorage,
  migrateRealmspanPlayerName,
} from "../../src/client/LocalStorageIsolation";

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

describe("Realmspan storage isolation", () => {
  it("namespaces reads, writes, enumeration and clear", () => {
    const raw = new MemoryStorage();
    raw.setItem("other-game.settings", "keep");
    const storage = createRealmspanScopedStorage(raw);

    storage.setItem("lang", "zh-CN");
    storage.setItem("gamesPlayed", "3");

    expect(raw.getItem("wgl:realmspan:lang")).toBe("zh-CN");
    expect(raw.getItem("wgl:realmspan:gamesPlayed")).toBe("3");
    expect(storage.length).toBe(2);
    expect([storage.key(0), storage.key(1)].sort()).toEqual([
      "gamesPlayed",
      "lang",
    ]);

    storage.clear();
    expect(storage.length).toBe(0);
    expect(raw.getItem("other-game.settings")).toBe("keep");
  });

  it("migrates only known working-title player-name keys", () => {
    const raw = new MemoryStorage();
    raw.setItem("territory-conquest.player-name", "Legacy");
    raw.setItem("lang", "foreign-language-setting");
    raw.setItem("other-game.settings", "keep");

    migrateRealmspanPlayerName(raw);

    expect(raw.getItem("wgl:realmspan:player-name")).toBe("Legacy");
    expect(raw.getItem("territory-conquest.player-name")).toBeNull();
    expect(raw.getItem("lang")).toBe("foreign-language-setting");
    expect(raw.getItem("other-game.settings")).toBe("keep");
  });
});
