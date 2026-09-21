import { afterEach, describe, expect, it } from "vitest";

import { ClientEnv } from "../../src/client/ClientEnv";
import {
  attributionUrl,
  licensesUrl,
  sourceCodeUrl,
  sourceRevisionLabel,
} from "../../src/client/LocalFork";

const SHA = "1234567890abcdef1234567890abcdef12345678";

function setBuildSha(sha: string) {
  ClientEnv.reset();
  (window as any).BOOTSTRAP_CONFIG = {
    gameEnv: "prod",
    turnstileSiteKey: "",
    jwtAudience: "localhost",
    gitCommit: sha,
  };
}

describe("local fork source links", () => {
  afterEach(() => {
    ClientEnv.reset();
    delete (window as any).BOOTSTRAP_CONFIG;
  });

  it("pins corresponding source links to an exact build SHA", () => {
    setBuildSha(SHA);

    expect(sourceCodeUrl()).toContain(`/tree/${SHA}`);
    expect(attributionUrl()).toContain(`/blob/${SHA}/NOTICE.md`);
    expect(licensesUrl()).toContain(
      `/blob/${SHA}/docs/THIRD_PARTY_LICENSES.md`,
    );
    expect(sourceRevisionLabel()).toBe(SHA.slice(0, 12));
  });

  it("falls back to main when no build SHA is available", () => {
    ClientEnv.reset();
    delete (window as any).BOOTSTRAP_CONFIG;

    expect(sourceCodeUrl()).toContain("/tree/main");
    expect(attributionUrl()).toContain("/blob/main/NOTICE.md");
    expect(licensesUrl()).toContain("/blob/main/docs/THIRD_PARTY_LICENSES.md");
    expect(sourceRevisionLabel()).toBe("main");
  });
});
