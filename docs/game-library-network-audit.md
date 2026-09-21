# Game-library network audit

Audit date: 2026-09-21

Build under test: `npm run build-game-library`, served as plain static files from `http://127.0.0.1:4174`.

Method: Chrome DevTools Protocol with `Network.enable`, cache disabled, request/response/failure capture, and runtime exception checks.

## Case A — normal network, complete match

Flow: Home -> Play Solo -> World / Easy / 1 Bot -> expansion / attack -> normal WinModal -> Exit -> Home.

The validation used existing single-player options (random spawn, infinite troops/gold, instant build) only to shorten the run. It did not call or mutate Core win state directly.

Result:

- 138 network requests.
- 0 cross-origin requests.
- 0 runtime network dependencies on OpenFront or CrazyGames.
- The actual WinModal displayed "Single-player match complete", then Exit returned home.

## Case B — official services actively blocked

Before navigation Chrome blocked:

- `*.openfront.io`
- `*.openfront.dev`
- `sdk.crazygames.com`
- `crazygames.com` and subdomains

Flow: Home -> Play Solo -> World / Easy / 10 Bots -> expand -> attack AI -> build City -> Quit -> Home.

Result:

- 94 requests, all same-origin.
- 0 external requests.
- 0 deny-list hits: the local flow never attempted the blocked official-service URLs.
- 0 runtime exceptions.
- Territory reached 2451 tiles, one City was built, and outgoing attacks reached 2.

## Case C — running match loses connectivity

Flow: Home -> Play Solo -> running World / Easy / 10 Bots -> Chrome network offline for five seconds -> restore network -> Quit.

Result:

- tick advanced from 2 to 51 while offline;
- the player remained alive;
- the loaded simulation continued without API/WebSocket access.

This proves only **running local match survives connection loss**. It is not a Fully Offline claim.

## Request table

| Host                     | Path               | Method     | Initiator               | Purpose                                                           | Decision                                    |
| ------------------------ | ------------------ | ---------- | ----------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `127.0.0.1:4174`         | `/`                | GET        | other / script          | Static application shell                                          | Keep                                        |
| `127.0.0.1:4174`         | `/assets/*`        | GET        | parser / script / other | JS, CSS and Worker bundles                                        | Keep                                        |
| `127.0.0.1:4174`         | `/_assets/maps/*`  | GET        | script                  | Map manifests and map binaries                                    | Keep                                        |
| `127.0.0.1:4174`         | `/_assets/*`       | GET        | parser / script / other | Hashed fonts, sprites, flags, sounds and other approved resources | Keep                                        |
| OpenFront official hosts | any                | —          | —                       | Auth, API, server list, multiplayer, telemetry                    | Remove from local path; no request observed |
| CrazyGames SDK hosts     | any                | —          | —                       | SDK, ad/account/gameplay lifecycle                                | Remove from local path; no request observed |
| CrazyGames game page     | explicit link only | navigation | user click              | External multiplayer entry                                        | Keep as opt-in navigation                   |

Case A request categories included 67 script-initiated and 18 parser-initiated `/_assets/*` requests, 20 map requests, and the static JS/CSS/application shell. All stayed on the test origin.

## Identity and transport boundary

Validated path:

`Play Solo -> local player identity -> local GameStartInfo -> LocalServer -> deterministic Core`

Code/runtime evidence:

- local bootstrap returns before server-list polling, CrazyGames SDK initialization, Turnstile prefetch and Auth/profile startup;
- `Main.handleJoinLobby()` skips `userAuth()`, profile cosmetics and Turnstile for `source=singleplayer`;
- `SinglePlayerModal` uses localStorage identity and local default cosmetics;
- `Transport.joinGame()` / `rejoinGame()` return before `getPlayToken()` when local;
- `LocalServer` does not upload `archive_singleplayer_game`;
- `InGamePromo` remains only as the Renderer-required DOM/controller placeholder and is a no-op in `LOCAL_ONLY_FORK`.

Case B confirms the code boundary at request level: blocking official services changed no tested local-game behavior.
