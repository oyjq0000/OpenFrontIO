const PREFIX = "wgl:realmspan:";
const LEGACY_PLAYER_KEYS = [
  "territory-conquest.player-name",
  "realmspan.player-name",
];

class ScopedStorage implements Storage {
  constructor(
    private readonly backing: Storage,
    private readonly prefix: string,
  ) {}

  private rawKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private keys(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.backing.length; i++) {
      const key = this.backing.key(i);
      if (key?.startsWith(this.prefix)) result.push(key);
    }
    return result;
  }

  get length(): number {
    return this.keys().length;
  }

  clear(): void {
    for (const key of this.keys()) this.backing.removeItem(key);
  }

  getItem(key: string): string | null {
    return this.backing.getItem(this.rawKey(key));
  }

  key(index: number): string | null {
    const raw = this.keys()[index];
    return raw === undefined ? null : raw.slice(this.prefix.length);
  }

  removeItem(key: string): void {
    this.backing.removeItem(this.rawKey(key));
  }

  setItem(key: string, value: string): void {
    this.backing.setItem(this.rawKey(key), value);
  }
}

export function createRealmspanScopedStorage(backing: Storage): Storage {
  return new ScopedStorage(backing, PREFIX);
}

export function migrateRealmspanPlayerName(backing: Storage): void {
  const target = `${PREFIX}player-name`;
  if (backing.getItem(target) !== null) return;
  for (const legacyKey of LEGACY_PLAYER_KEYS) {
    const value = backing.getItem(legacyKey);
    if (value === null) continue;
    backing.setItem(target, value);
    backing.removeItem(legacyKey);
    return;
  }
}

export function installRealmspanStorageIsolation(): void {
  const marker = "__realmspanStorageIsolationInstalled";
  if ((window as unknown as Record<string, unknown>)[marker] === true) return;

  const rawLocalStorage = window.localStorage;
  const rawSessionStorage = window.sessionStorage;
  migrateRealmspanPlayerName(rawLocalStorage);

  const localStorage = createRealmspanScopedStorage(rawLocalStorage);
  const sessionStorage = createRealmspanScopedStorage(rawSessionStorage);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => localStorage,
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    get: () => sessionStorage,
  });
  Object.defineProperty(window, marker, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
}
