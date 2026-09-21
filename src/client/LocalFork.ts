export const LOCAL_ONLY_FORK = true;

export const WORKING_TITLE = "Territory Conquest";
export const ONLINE_PLAY_URL =
  "https://www.crazygames.com/game/openfront-gsw";
export const SOURCE_CODE_URL = "https://github.com/oyjq0000/OpenFrontIO";
export const ATTRIBUTION_URL =
  "https://github.com/oyjq0000/OpenFrontIO/blob/main/NOTICE.md";

const PLAYER_NAME_KEY = "territory-conquest.player-name";
const DEFAULT_PLAYER_NAME = "Player";
const MAX_PLAYER_NAME_LENGTH = 20;

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
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_PLAYER_NAME_LENGTH).trim();
}
