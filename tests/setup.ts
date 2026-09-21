// Add global mocks or configuration here if needed
import "vitest-canvas-mock";
// Registers the per-test DOM teardown. Imported here, and not from individual
// test files, so its hooks are registered before any test file's own -- see the
// hook-order note in that file.
import "./domTeardown";

// Node 26 exposes an experimental global localStorage accessor that resolves to
// undefined unless --localstorage-file is configured. It can shadow jsdom's
// storage globals, so provide the small Web Storage surface the tests use.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(String(key)) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => void data.delete(String(key)),
    setItem: (key: string, value: string) =>
      void data.set(String(key), String(value)),
  };
}

if (typeof window !== "undefined") {
  const local = memoryStorage();
  const session = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: local,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: session,
  });
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: local,
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: session,
  });
}

// ServerEnv.gitCommit() throws when unset; the dev server sets GIT_COMMIT=DEV,
// so tests exercising server code (e.g. the lobby feed) mirror that.
process.env.GIT_COMMIT ??= "DEV";
