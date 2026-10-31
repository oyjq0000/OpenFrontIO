# Realmspan selective tutorial and map port — 2026-10-31

## Scope and provenance

- Upstream: openfrontio/OpenFrontIO; primary tutorial commits 74450eb9 (hidden map), b01cfd91 (scenario rules), 8ca8e589 (guided overlay and UI). Tutorial code and map are pinned to the six-step revision at 8ca8e589 rather than the later nuke-focused redesign.
- New geography: BabelMandebStrait, Benelux, CapeOfGoodHope, HornOfAfrica, Madagascar, RioDeJaneiro, VancouverIsland. Imported the corresponding map-generator info/images and compiled open-resource manifests, terrain and thumbnails from upstream main 030274df6e377a57e784a9f6f9865720b0dfbbba.
- Deliberately excluded Brainrot and OmmaTrypTa pending separate editorial, content and licensing review.
- The original Guanabara map already serializes as Rio de Janeiro. The new RioDeJaneiro map is renamed locally to Rio de Janeiro (Region) in generated types, map info, runtime manifest and translations. Test rejects future duplicate canonical enum values; preserve existing Guanabara compatibility.
- Hidden Tutorial map is never offered by regular map picker/random picker or multiplayer rotation. Only the explicit guided tutorial can launch it.

## Local-only boundaries

- Gameplay runs through LocalFork / LocalServer / deterministic core and same-origin static assets. Never re-enable official login, WebSocket multiplayer, telemetry, payment, CrazyGames/Poki SDK, or proprietary assets.
- Guided steps: spawn in marker, expand, understand troop bar, defeat tribe, sail to islet, defeat nation. Opponents expand passively and have a tutorial-only 10% troop cap. Victory requires eliminating AI and offers regular solo play.
- Tutorial input guard is attached only to a single game Transport. The overlay resets when a new match starts; the old advanced TutorialPanel and regular WinModal are suppressed in tutorial mode.
- Tutorial completion must not submit a normal QuestHub run-result, as this is a scripted beginner scenario. Normal single-player scoring continues unchanged.
- Navigation must stay inside the GAME_LIBRARY_BASE_PATH /games/realmspan/; URL query solo_guide is consumed by local bootstrap.
- All licenses, third-party attribution, resource scans and QuestHub Bridge v2 contract must remain intact.

## Release gates

- Required: npx tsc --noEmit, MapConsistency and Onboarding unit tests, full tests in Linux CI, npm run lint, npm run build-game-library with GAME_LIBRARY_BASE_PATH=/games/realmspan/, Git diff check and final proprietary audit.
- Browser smoke: first visit, tutorial start/intro, valid and invalid spawn, attack/boat intent filtering, AI presence and passive behavior, tutorial win/exit, normal solo after the tutorial; normal solo startup for at least one new map and existing map.
- Browser test under a local static server must serve at /games/realmspan/ and not only the server root. CSP and external-network denylist must be tested against the distribution output before production.
- Release order: fork commit and PR -> pinned web-game-library archive SHA and vendor -> Runtime Preview and production -> exact library catalog/contract sync -> Portal Preview and production. Restore prior Cloudflare Pages distribution if rollout smoke fails.

## Test notes

- On 2026-10-31, TypeScript check passed; MapConsistency and pure onboarding unit tests passed 25/25.
- A build with GAME_LIBRARY_BASE_PATH=/games/realmspan/ passed and reported zero proprietary resource matches. Runtime integration smoke and full CI gates are mandatory before merge.
