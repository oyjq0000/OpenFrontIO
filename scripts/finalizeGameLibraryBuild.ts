import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPSTREAM_BASELINE = "bb8af015b515b3b717bd4d901074c5f4c16641cb";
const SOURCE_REPOSITORY = "https://github.com/oyjq0000/OpenFrontIO";
const FORBIDDEN_PATHS = [
  "proprietary/fonts/OpenFront.ttf",
  "proprietary/images/Favicon.svg",
  "proprietary/images/OF.png",
  "proprietary/images/OF.webp",
  "proprietary/images/OpenFront.png",
  "proprietary/images/OpenFront.webp",
  "proprietary/images/OpenFrontLogo.png",
  "proprietary/images/OpenFrontLogo.svg",
  "proprietary/images/OpenFrontLogoDark.svg",
  "proprietary/sounds/effects/game-start-alert.mp3",
  "proprietary/sounds/music/gameplay.mp3",
  "proprietary/sounds/music/menu-theme.mp3",
];
const FORBIDDEN_TEXT = [
  "proprietary/",
  "OpenFrontLogo",
  "OpenFront.ttf",
  "gameplay.mp3",
  "menu-theme.mp3",
  "game-start-alert.mp3",
];
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
  ".xml",
]);

function sha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

async function walk(root: string, rel = ""): Promise<string[]> {
  const entries = await fs.readdir(path.join(root, rel), {
    withFileTypes: true,
  });
  const files: string[] = [];
  for (const entry of entries) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await walk(root, child)));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}
async function main(): Promise<void> {
  const root = path.join(import.meta.dirname, "..");
  const staticDir = path.join(root, "static");
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const indexHtml = await fs.readFile(
    path.join(staticDir, "index.html"),
    "utf8",
  );
  if (indexHtml.includes("<%")) {
    throw new Error("game-library index.html still contains EJS placeholders");
  }
  if (!indexHtml.includes(`gitCommit: "${head}"`)) {
    throw new Error(`game-library index.html does not embed fork SHA ${head}`);
  }

  const files = (await walk(staticDir)).sort();
  const forbiddenNames = new Set(
    FORBIDDEN_PATHS.map((item) => path.basename(item).toLowerCase()),
  );
  const pathMatches = files.filter((rel) => {
    const lower = rel.toLowerCase();
    return (
      lower.includes("proprietary/") || forbiddenNames.has(path.basename(lower))
    );
  });
  const forbiddenBySize = new Map<number, Set<string>>();
  for (const rel of FORBIDDEN_PATHS) {
    const blob = execFileSync("git", ["show", `${UPSTREAM_BASELINE}:${rel}`], {
      cwd: root,
      maxBuffer: 16 * 1024 * 1024,
    });
    const hashes = forbiddenBySize.get(blob.byteLength) ?? new Set<string>();
    hashes.add(sha256(blob));
    forbiddenBySize.set(blob.byteLength, hashes);
  }

  const hashMatches: string[] = [];
  const contentMatches: string[] = [];
  for (const rel of files) {
    const full = path.join(staticDir, rel);
    const stat = await fs.stat(full);
    const candidateHashes = forbiddenBySize.get(stat.size);
    if (candidateHashes) {
      const data = await fs.readFile(full);
      if (candidateHashes.has(sha256(data))) hashMatches.push(rel);
    }
    if (
      TEXT_EXTENSIONS.has(path.extname(rel)) &&
      stat.size < 10 * 1024 * 1024
    ) {
      const text = await fs.readFile(full, "utf8");
      if (FORBIDDEN_TEXT.some((needle) => text.includes(needle))) {
        contentMatches.push(rel);
      }
    }
  }
  const overpassLicenseIncluded = files.some((rel) =>
    /_assets\/fonts\/OFL-Overpass\.[0-9a-f]+\.txt$/.test(rel),
  );
  const roundFontLicenseIncluded = files.some((rel) =>
    /_assets\/fonts\/CC0-round-6x6\.[0-9a-f]+\.txt$/.test(rel),
  );
  if (pathMatches.length || hashMatches.length || contentMatches.length) {
    throw new Error(
      `proprietary build audit failed: ${JSON.stringify({ pathMatches, hashMatches, contentMatches })}`,
    );
  }
  if (!overpassLicenseIncluded) {
    throw new Error(
      "Overpass OFL license was not copied into the static build",
    );
  }
  if (!roundFontLicenseIncluded) {
    throw new Error(
      "round_6x6 CC0 provenance note was not copied into the static build",
    );
  }

  const packageLock = await fs.readFile(path.join(root, "package-lock.json"));
  const modifiedFiles = execFileSync(
    "git",
    ["diff", "--name-only", `${UPSTREAM_BASELINE}..${head}`],
    { cwd: root, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  const buildInfo = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    workingTitle: "Territory Conquest",
    upstreamRepository: "https://github.com/openfrontio/OpenFrontIO",
    upstreamBaseline: UPSTREAM_BASELINE,
    forkRepository: SOURCE_REPOSITORY,
    forkSha: head,
    correspondingSource: `${SOURCE_REPOSITORY}/tree/${head}`,
    buildCommand: "npm run build-game-library",
    packageLockSha256: sha256(packageLock),
    modifiedFiles,
    licenses: {
      code: `${SOURCE_REPOSITORY}/blob/${head}/LICENSE`,
      openAssets: `${SOURCE_REPOSITORY}/blob/${head}/LICENSE-ASSETS`,
      notice: `${SOURCE_REPOSITORY}/blob/${head}/NOTICE.md`,
      overpass: "fonts/OFL-Overpass.txt (SIL OFL 1.1)",
      round6x6: "fonts/CC0-round-6x6.txt (CC0 provenance)",
      thirdParty: `${SOURCE_REPOSITORY}/blob/${head}/docs/THIRD_PARTY_LICENSES.md`,
    },
    assetAudit: {
      proprietaryPathMatches: pathMatches,
      proprietaryHashMatches: hashMatches,
      proprietaryTextMatches: contentMatches,
      overpassLicenseIncluded,
      roundFontLicenseIncluded,
    },
    offlineClaim:
      "No fully-offline claim; only loaded-match connection-loss survival is tested.",
  };
  await fs.writeFile(
    path.join(staticDir, "game-library-build-info.json"),
    `${JSON.stringify(buildInfo, null, 2)}\n`,
  );
  console.log(
    `game-library build: ${files.length + 1} files; fork ${head.slice(0, 12)}; proprietary matches 0`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
