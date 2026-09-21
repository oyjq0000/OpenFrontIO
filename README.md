# Territory Conquest

> Working title for a modified, unofficial local single-player edition based on the open-source OpenFront project.

This fork is intended for a Web game library. The playable build keeps OpenFront's deterministic single-player core, maps, bots, rendering, HUD, combat, building, and local settings while disabling the official multiplayer/account/commerce ecosystem.

- Upstream: https://github.com/openfrontio/OpenFrontIO
- Fork baseline: `bb8af015b515b3b717bd4d901074c5f4c16641cb`
- Source: https://github.com/oyjq0000/OpenFrontIO
- Online multiplayer is not operated by this fork; the UI links externally to CrazyGames.
- This project is not official OpenFront and is not endorsed by OpenFront Inc.

See [NOTICE.md](NOTICE.md) for attribution and modification details, and [docs/THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md) for third-party asset licenses.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Open assets: CC BY-SA 4.0](https://img.shields.io/badge/Assets-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

## License

OpenFront source code is licensed under the **GNU Affero General Public License v3.0**

Current copyright notices appear in:

- Footer: "© OpenFront and Contributors"
- Loading screen: "© OpenFront and Contributors"

Modified versions must preserve these notices in reasonably visible locations.

See the [LICENSE](LICENSE) for complete requirements.

For asset licensing, see [LICENSE-ASSETS](LICENSE-ASSETS).  
For license history, see [LICENSING.md](LICENSING.md).
For third-party fonts and other independently licensed resources, see [docs/THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md).

## 🌟 Local edition features

- **Single Player + Bots** using OpenFront's existing deterministic core and LocalServer
- **Multiple maps and difficulties**, including the World map
- **Territory expansion, combat, buildings, resources, pause and game-speed controls**
- **Local player name/settings** without an OpenFront account
- **External Play Online link** to CrazyGames; multiplayer is not hosted by this fork
- **Browser-based local gameplay** with same-origin static assets; real mobile hardware is not yet verified

## 📋 Prerequisites

- [npm](https://www.npmjs.com/) (v10.9.2 or higher)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/oyjq0000/OpenFrontIO.git
   cd OpenFrontIO
   git remote add upstream https://github.com/openfrontio/OpenFrontIO.git
   git remote set-url --push upstream DISABLED
   ```

2. **Install dependencies**

   ```bash
   npm run inst
   ```

   Do NOT use `npm install` nor `npm i` but instead use our `npm run inst`. It runs the safer `npm ci --ignore-scripts` to install dependencies exactly according to the versions in `package-lock.json` and doesn't run scripts. This can prevent being hit by a supply chain attack.

## 🎮 Running the local game

The local game path does not require the OpenFront multiplayer server or official API. Run the client only:

```bash
SKIP_BROWSER_OPEN=true npm run start:client
```

Vite serves the game at `http://localhost:9000/` by default. Open **Play Solo** to start the existing LocalServer + deterministic core in the browser.

`npm run dev` and the server scripts remain in the repository for upstream compatibility, but they are not required for the game-library edition and are not part of its supported play path.

Build the directly hostable game-library edition with:

```bash
npm run build-game-library
```

This build emits a same-origin static `static/` tree, embeds the current fork commit SHA, writes `game-library-build-info.json`, includes third-party font license records, and fails if the final output matches restricted upstream proprietary asset paths, hashes, or forbidden references.

`npm run build-prod` is retained for upstream/server compatibility. Its HTML is a server-rendered template and is **not** the supported direct-CDN artifact for this fork.

Do not point the game-library edition at OpenFront staging/production APIs; account, multiplayer, store, telemetry and single-player upload flows are intentionally outside this fork's local play path.

The supported claim is **local single-player simulation without an OpenFront account or multiplayer servers**. A running, already-loaded match has been tested through connection loss, but a fresh page load / new match with no network has not been validated with a Service Worker or complete offline cache. Do not describe this build as fully offline.

## 🛠️ Development Tools

- **Format code**:

  ```bash
  npm run format
  ```

- **Lint code with Oxlint and ESLint**:

  ```bash
  npm run lint
  ```

- **Lint and fix code with Oxlint and ESLint**:

  ```bash
  npm run lint:fix
  ```

- **Testing**
  ```bash
  npm test
  ```

## 🏗️ Project Structure

- `/src/client` - Frontend game client
- `/src/core` - Deterministic game simulation
- `/src/server` - Backend game server
- `/resources` - Static assets (images, maps, etc.)
- `/zbin` - Compact binary wire format for zod schemas (self-contained, zod-only)

## 🤝 Contributing

Contributions and translations are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, the approved-issue process, project governance, and translation info.
