# Upstream review log

This fork intentionally does not merge upstream `main` wholesale. It preserves the local-only single-player boundary and reviews later upstream commits individually.

- Initial upstream baseline: `bb8af015b515b3b717bd4d901074c5f4c16641cb`
- Latest upstream reviewed through: `8e6909360c8d4907f113242a856f35af48a2e5fc`
- Review date: 2026-09-22
- Upstream: https://github.com/openfrontio/OpenFrontIO
- Fork: https://github.com/oyjq0000/OpenFrontIO

## Adopted

| Upstream commit                            | Decision | Fork effect                                                                                                             |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `4bf92e3c98201326003f790839e04dfcc43ff41a` | ADOPT    | Core economy balance: trade saturation midpoint 230→330 and train midpoint 500→560, with upstream regression snapshots. |
| `8a20597f6631e733f40e9a1dec2d2012cc916df4` | ADOPT    | Local event UI now resolves translated unit names for intercepted/destroyed units; includes Core/client tests.          |
| `8e6909360c8d4907f113242a856f35af48a2e5fc` | ADOPT    | Channel Islands terrain/map data fix used by local play; generated map data and open-resource assets updated.           |

## Skipped

| Upstream commit                            | Decision | Reason                                                                                                                                                                                                                                                                  |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `95e0a9aad57f776870b8e2d730db5055f5507d64` | SKIP     | Token-login/Auth modal retry fix. Local single-player bootstrap does not use the account/token-login path.                                                                                                                                                              |
| `7defd2483b160b41f45a8363d4453435f6832740` | SKIP     | Multiplayer SocketIngress logging only; server runtime is outside this fork's supported distribution.                                                                                                                                                                   |
| `3ac07c1670cff68d5abb5fef569d6f9fada54c6b` | SKIP     | MLS v5.17 bulk translation refresh. No local-only correctness fix; importing thousands of unrelated localization lines would add review noise without changing the supported runtime boundary.                                                                          |
| `99eeddb93531d596e769c4612454f0b6fb251f1b` | SKIP     | Upstream server-resolution hardening for static/multiplayer pages. The local fork returns into its local bootstrap before server-list/lobby transport; adopting this would expand unrelated multiplayer-path divergence without affecting the supported Play Solo path. |

## Verification

The adopted commits must pass the fork's full local-only gate before merge:

- `npm test`
- `npm run build-game-library`
- `npm run lint`
- `npx prettier --check .`
- `git diff --check`
- browser smoke with normal network, blocked official domains, and loaded-match connection loss
- Nations advanced-behavior regression
- final proprietary-runtime-asset audit

The initial baseline remains unchanged for provenance. Exact corresponding source for every distributed build is the fork commit embedded by `build-game-library`.
