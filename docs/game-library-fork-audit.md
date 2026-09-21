# Game-library fork audit

Baseline: `bb8af015b515b3b717bd4d901074c5f4c16641cb`
Upstream: `https://github.com/openfrontio/OpenFrontIO`
Fork: `https://github.com/oyjq0000/OpenFrontIO`
Audit date: 2026-09-21

## Scope

Goal: preserve OpenFront single-player gameplay while making the playable path independent of OpenFront accounts, official APIs, multiplayer servers, CrazyGames SDK, Steam shell integrations, payments, telemetry, and proprietary assets.

## Architecture decision

**KEEP CURRENT BOOTSTRAP.** `Main.initialize()` enters `initializeLocalFork()` and returns before the original online boot path reaches CrazyGames initialization, server-list polling, Turnstile prefetch, Auth/profile loading, store/account setup, or telemetry. The single-player join path has explicit local branches and `Transport.joinGame()` / `rejoinGame()` return before play-token acquisition.

The current feature gate is concentrated enough that adding a separate `LocalGameMain.ts` would duplicate mature initialization code without removing a demonstrated runtime dependency. The correction round therefore retained the existing Core, AI, renderer, HUD, LocalServer and local UI, and only added local distribution / boundary fixes.

## Single-player dependency graph

```text
Home / Play Solo
  -> SinglePlayerModal
     -> local player name (localStorage)
     -> local map manifests/assets (/resources)
     -> join-lobby event (source=singleplayer)
        -> Main.handleJoinLobby
           -> joinLobby
              -> Transport selects LocalServer for GameType.Singleplayer
                 -> deterministic src/core
                 -> bots / map / combat / buildings / resources
                 -> renderer + HUD + local settings
                 -> win / quit -> LocalServer.endGame (local only)
```

## Network classification

| Dependency                               | Baseline behavior                       | Local fork                                          | Classification         |
| ---------------------------------------- | --------------------------------------- | --------------------------------------------------- | ---------------------- |
| map/static assets                        | same-origin/CDN asset fetches           | same-origin static resources                        | required               |
| `/auth/refresh`, `/users/@me`            | boot + cosmetics/name path              | not called by local boot/start                      | remove from local path |
| server list                              | boot polling                            | local boot returns before polling starts            | remove from local path |
| multiplayer WebSocket                    | lobby/game transport                    | no multiplayer entry; singleplayer uses LocalServer | remove from local path |
| `archive_singleplayer_game`              | upload on winner/teardown               | code removed from LocalServer                       | remove                 |
| CrazyGames SDK                           | external script + gameplay/ad/auth APIs | external script removed; no SDK call on local path  | remove                 |
| Turnstile                                | external script + boot prefetch         | script removed; no local prefetch                   | remove                 |
| Store / subscription / Stripe            | account/store UI                        | not mounted or initialized                          | remove from local path |
| Steam linking/shell UI                   | boot/account flows                      | not mounted or initialized                          | remove from local path |
| Google/Playwire/Cloudflare telemetry/ads | page scripts                            | removed from `index.html`                           | remove                 |
| CrazyGames page                          | none / SDK integration                  | normal external `target=_blank` link only           | optional external      |

## UI surface

Visible home controls are limited to Play Solo, Play Online, local player name, Settings, Help / Controls, Attribution, and Source Code. Account, Shop, Store, Inventory, Multiplayer lobby, Ranked, Clan, Leaderboard, login and Steam controls are not mounted on the local page.

## Asset audit

Baseline `/proprietary` contained 12 restricted runtime assets plus its license: one font, eight logo/brand images, one alert sound, and two music tracks. There were no same-path equivalents in `/resources`.

Actions:

- proprietary OpenFront logos/images: removed; UI uses a text working title.
- proprietary OpenFront font: removed; browser/open resource fonts remain.
- proprietary game-start alert: multiplayer-only caller changed to open `/resources/sounds/effects/game-start.mp3`.
- proprietary menu/gameplay music: removed; background music disabled rather than substituted with an inappropriate effect.
- Vite production manifest now uses `/resources` only.
- Vite dev no longer installs the proprietary asset-serving middleware.
- Docker no longer copies `/proprietary` into the build stage.
- `proprietary/LICENSE` is retained only as the upstream restriction notice.

## Deliberately retained upstream code

The deterministic core, LocalServer, bots, map formats/loaders, rendering, HUD, buildings, combat, resource mechanics, sound effects/ambience from open resources, and local settings remain intact. Multiplayer/account modules can remain in source for upstream mergeability, but the local-only startup path does not initialize them and the local HTML does not mount their UI.

## Follow-up debt

- Replace the working title and text-only brand when final naming/brand assets are ready.
- Re-evaluate unused online modules for bundle-size pruning only after gameplay parity is stable; do not refactor the core merely for cleanliness.
- Add a replacement menu/gameplay music track only when its license is explicitly compatible with distribution.

## Runtime validation

Browser validation uses the production-style `npm run build-game-library` output served as plain static files. The actual-game coverage includes Spawn, expansion, AI attack, City construction, pause/resume, game speed, win handling and Quit-to-home. The strict request-level evidence is in `docs/game-library-network-audit.md`.

Case A reached the actual `Single-player match complete` WinModal and exited home with 138 same-origin requests and 0 external requests. Case B actively blocked OpenFront/CrazyGames hosts and still completed expand, AI attack, City build and Quit with 0 deny-list hits. Case C advanced from tick 2 to 51 during a five-second browser network outage.

## Nations and advanced mechanisms

Bots and Nations remain distinct AI layers. `NationExecution` still composes `AiAttackBehavior`, `NationAllianceBehavior`, `NationStructureBehavior`, `NationWarshipBehavior`, `NationNukeBehavior` and `NationMIRVBehavior`. No Nation AI code was removed.

**Actual gameplay tested:** World / Impossible / 8 Nations / 20M starting gold. At tick 2 the eight Nation players existed but had not spawned. By tick 156 all eight were alive and had expanded to roughly 811–1574 tiles. All had built a SAM Launcher and City; Nunavut also had a Transport; several Nations had active outgoing attacks. This proves the local browser path actually instantiates and runs Nation AI rather than only simple Bots.

**Automated test only:** advanced structure/economy, Nation alliances/betrayal, Ports/trade, Warships/counter-warships, nuclear behavior and MIRV behavior. The focused verification passed **16 test files / 201 tests**. These features remain in the deterministic Core, but the browser Nation smoke did not happen to exercise every advanced mechanism, so they are not labeled as actual gameplay observations.

## Static distribution and asset audit

`npm run build-game-library` is the supported direct-hosting build. It resolves the upstream server EJS placeholders at build time, embeds the current fork SHA, keeps application/Worker/assets same-origin, emits `game-library-build-info.json`, and runs a final proprietary audit.

The finalizer checks:

- forbidden proprietary path/name matches;
- exact SHA-256 matches against the proprietary files at the upstream baseline;
- forbidden textual references in distributable text assets;
- inclusion of third-party font license/provenance records.

Overpass is recorded under **SIL OFL 1.1** in `resources/fonts/OFL-Overpass.txt`. The `round_6x6_modified` bitmap font is traced to upstream commit `c5c04a8d83b593cd2e9a881c116e99a5c8b06737`, whose commit description identifies its source font as CC0; the provenance record is `resources/fonts/CC0-round-6x6.txt`. See `docs/THIRD_PARTY_LICENSES.md`.

The supported product statement is **local single-player simulation without an OpenFront account or multiplayer servers**. A freshly opened page with no network has not been validated with a Service Worker/full cache, so the fork does not claim Fully Offline operation.

## Performance observations

Production static build, World / Easy, connected M5 Pro Mac:

| Bots |            Start -> playable | rAF FPS (3s) |   JS heap | Chrome process-tree CPU sample | Chrome process-tree RSS |
| ---: | ---------------------------: | -----------: | --------: | -----------------------------: | ----------------------: |
|  100 | ~2.59 s in clean-profile run |       ~120.1 | ~74.5 MiB |                         ~36.3% |               ~1.61 GiB |
|  400 | ~2.74 s in clean-profile run |       ~120.1 | ~81.0 MiB |                         ~41.4% |               ~1.64 GiB |

The CPU/RSS figures are whole isolated Chrome-profile process-tree samples and include browser/GPU/renderer overhead; they are not a Core Worker-only measurement. A separate warm-profile timing showed ~0.48 s to playable for both bot counts, demonstrating that cold profile/static-cache state materially affects start time. No default bot count or game balance was changed.

**Not verified on real mobile hardware.**

## Verification

Final clean verification order: remove generated `static/`, run the complete test suite, build with `npm run build-game-library`, then lint and diff checks.

- client/core suite: **502 files / 6534 tests passed**;
- server suite: **69 files / 768 tests passed**;
- focused Nations/advanced suite: **16 files / 201 tests passed**;
- `npm run build-game-library`: passed;
- final static proprietary audit: **0 path matches, 0 SHA-256 matches, 0 forbidden text references**;
- `npm run lint`: Oxlint 0 warnings/errors; ESLint passed;
- `git diff --check`: passed.
