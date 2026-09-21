import { ClientEnv } from "./ClientEnv";

export const LOCAL_ONLY_FORK = true;
export const WORKING_TITLE = "Territory Conquest";
export const ONLINE_PLAY_URL = "https://www.crazygames.com/game/openfront-gsw";

export const SOURCE_REPOSITORY_URL = "https://github.com/oyjq0000/OpenFrontIO";
export const SOURCE_BRANCH = "main";
export const UPSTREAM_REPOSITORY_URL =
  "https://github.com/openfrontio/OpenFrontIO";
export const UPSTREAM_BASELINE_SHA = "bb8af015b515b3b717bd4d901074c5f4c16641cb";

const PLAYER_NAME_KEY = "territory-conquest.player-name";
const DEFAULT_PLAYER_NAME = "Player";
const MAX_PLAYER_NAME_LENGTH = 20;

function currentBuildRevision(): string | null {
  try {
    const revision = ClientEnv.gitCommit();
    return /^[0-9a-f]{40}$/i.test(revision) ? revision : null;
  } catch {
    return null;
  }
}
function sourceRef(): string {
  return currentBuildRevision() ?? SOURCE_BRANCH;
}

export function sourceCodeUrl(): string {
  return `${SOURCE_REPOSITORY_URL}/tree/${sourceRef()}`;
}

export function attributionUrl(): string {
  return `${SOURCE_REPOSITORY_URL}/blob/${sourceRef()}/NOTICE.md`;
}

export function codeLicenseUrl(): string {
  return `${SOURCE_REPOSITORY_URL}/blob/${sourceRef()}/LICENSE`;
}

export function licensesUrl(): string {
  return `${SOURCE_REPOSITORY_URL}/blob/${sourceRef()}/docs/THIRD_PARTY_LICENSES.md`;
}

export function assetLicenseUrl(): string {
  return `${SOURCE_REPOSITORY_URL}/blob/${sourceRef()}/LICENSE-ASSETS`;
}

export function upstreamBaselineUrl(): string {
  return `${UPSTREAM_REPOSITORY_URL}/tree/${UPSTREAM_BASELINE_SHA}`;
}

export function sourceRevisionLabel(): string {
  return (currentBuildRevision() ?? SOURCE_BRANCH).slice(0, 12);
}
function localStorageOrNull(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function getLocalPlayerName(): string {
  const storage = localStorageOrNull();
  const stored = storage?.getItem(PLAYER_NAME_KEY) ?? "";
  const normalized = normalizeLocalPlayerName(stored);
  if (normalized.length > 0) return normalized;
  storage?.setItem(PLAYER_NAME_KEY, DEFAULT_PLAYER_NAME);
  return DEFAULT_PLAYER_NAME;
}

export function setLocalPlayerName(value: string): string {
  const normalized = normalizeLocalPlayerName(value) || DEFAULT_PLAYER_NAME;
  localStorageOrNull()?.setItem(PLAYER_NAME_KEY, normalized);
  return normalized;
}

function normalizeLocalPlayerName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_PLAYER_NAME_LENGTH)
    .trim();
}
