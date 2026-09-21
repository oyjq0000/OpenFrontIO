# Game-library fork audit

Baseline: `bb8af015b515b3b717bd4d901074c5f4c16641cb`
Upstream: `https://github.com/openfrontio/OpenFrontIO`
Fork: `https://github.com/oyjq0000/OpenFrontIO`
Audit date: 2026-09-21

## Scope

Goal: preserve OpenFront single-player gameplay while making the playable path independent of OpenFront accounts, official APIs, multiplayer servers, CrazyGames SDK, Steam shell integrations, payments, telemetry, and proprietary assets.

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

Browser smoke tests used a local Vite server and Chrome DevTools Protocol against the actual page, not a mocked game shell.

- Default config confirmed as World / Easy / 400 bots / manual spawn.
- Start Game to the visible spawn-selection prompt was observed at about 2.11 s on the connected development Mac.
- 10-bot random-spawn smoke coverage included a session beyond three simulated minutes, plus separate action passes for expansion, attack, building, pause/resume and speed controls.
- Expansion increased owned territory from 52 to 668+ tiles; a later AI attack increased outgoing attacks from 1 to 2.
- Building a City increased owned units from 0 to 1.
- Pause held the simulation at essentially one boundary tick; resume continued from 321 to 352 ticks in the observation window.
- Game-speed changes were delivered through the existing EventBus / LocalServer path.
- A minimal local match reached the win modal, displayed the modified-version result notice, and Quit returned to the local home page.
- Play Online was clicked in the real page and opened a new browser target at the CrazyGames OpenFront URL.

## Network and offline observations

Resource Timing reported zero cross-origin resource requests from local home load through Play Solo, map load, expansion, attack, build and win/quit smoke tests. The CrazyGames navigation occurs only after the explicit Play Online click, in a new tab.

With Chrome network emulation switched offline after resources were already loaded, the local game remained alive and advanced from tick 58 to 59 during a deliberately heavy observation window. This verifies that an already-loaded match does not depend on a remote API or WebSocket to continue.

## Performance observations

The production build contains about 623 MiB of static files, dominated by maps and other resources. The main minified JS bundle is about 2.42 MiB (619 KiB gzip) and the core Worker bundle about 668 KiB (182 KiB gzip).

World / Easy / 400 bots with random spawn successfully left the spawn phase and reached tick 15 after 15 seconds with the player alive. This is functional, but materially slower than lighter bot counts. A sampled long-lived development Chrome showed renderer RSS in the roughly 300 MiB range; because that Chrome profile contained multiple test tabs, this is not a clean single-tab memory benchmark.

Recommendation: keep 400 bots available, but consider roughly 100 bots as the game-library entry default after low-end-device validation. No balance/default change is made in this fork.

## Verification commands

- `npm test`: 501 files / 6532 tests passed, followed by the server phase with 69 files / 768 tests passed.
- `npm run build-prod`: TypeScript and Vite production build passed.
- `npm run lint`: Oxlint and ESLint passed.
- `git diff --check`: passed.
