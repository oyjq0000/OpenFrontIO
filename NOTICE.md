# NOTICE — Territory Conquest working title

This repository is a modified, unofficial version of the open-source OpenFront project.
It is not the official OpenFront product and is not endorsed by OpenFront Inc.

## Upstream

- Project: OpenFront
- Upstream repository: https://github.com/openfrontio/OpenFrontIO
- Fork repository: https://github.com/oyjq0000/OpenFrontIO
- Fork baseline: `bb8af015b515b3b717bd4d901074c5f4c16641cb`
- Modification date: 2026-09-21

## Code license

The upstream source code is licensed under GNU AGPL v3 as provided in `LICENSE`, including the additional attribution and non-misrepresentation terms in that file. Modified source remains subject to those terms.

The visible notice `© OpenFront and Contributors` is preserved in the application footer.

## Open assets

OpenFront documents `/resources` under CC BY-SA 4.0 in `LICENSE-ASSETS` and `LICENSING.md`. The fork preserves those license files and attribution. Independently licensed third-party resources inside that tree are recorded separately in `docs/THIRD_PARTY_LICENSES.md`; notably Overpass is SIL OFL 1.1 and `round_6x6_modified` is derived from a CC0 bitmap font.

## Proprietary assets

Assets under upstream `/proprietary` are All Rights Reserved. Proprietary runtime assets were removed from the current source tree and are excluded from the supported game-library build. `proprietary/LICENSE` is retained as an upstream license record. The upstream baseline remains referenced by commit SHA and Git history is not rewritten.

## Fork modifications

- Added a local-only single-player entry using the existing LocalServer + deterministic core.
- Removed official account/API dependencies from the single-player start path.
- Disabled official multiplayer/lobby/matchmaking/ranked/clan/leaderboard/store/payment UI in the local build.
- Removed single-player archive/achievement upload to OpenFront services.
- Removed CrazyGames SDK, Turnstile, advertising, analytics, and official telemetry scripts from the local page.
- Added an external `Play Online` link to CrazyGames; multiplayer is not operated by this fork.
- Replaced OpenFront primary branding with the working title `Territory Conquest` and an explicit modified/unofficial notice.
- Excluded proprietary assets from Vite and Docker build inputs; background music is intentionally disabled until replacement assets are supplied.

## Source availability

Corresponding source for this modified version is published at:

https://github.com/oyjq0000/OpenFrontIO

The game-library static build embeds its exact fork commit SHA in `BOOTSTRAP_CONFIG`, exposes a Source link pinned to that revision, and emits `game-library-build-info.json` with the upstream baseline, fork SHA, build command, package-lock SHA-256, modified-file list, license links, and asset-audit result.

Reproducible build entry point: `npm run build-game-library`.

This fork claims local single-player simulation without OpenFront accounts or multiplayer servers. It does not claim that a fresh page load is fully offline.
