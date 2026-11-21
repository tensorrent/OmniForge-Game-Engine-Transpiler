# OmniForge Game Engine Transpiler — static site

OmniForge, a TensorRent project (KOBA42), converts game archives, 3D scenes and spatial assets into
`.sprz` packages. TensorRent is a research division of KOBA42.

This repository holds the static web distribution only, ready for **GitHub Pages**. It contains no
uncompiled backend or SDK source.

## What is in this repository

- **Static client:** the compiled bundle (`index.html`, `assets/*`), the deploy-time settings file
  (`config.js`) and the privacy notice (`privacy.html`), under the
  [Sovereign Integrity Protocol License (SIP License v1.1)](./LICENSE.txt). Bundled third-party code
  is listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
- An optional conversion backend is not public; the Pages site runs in the browser only.

## Backend address

`config.js` ships with no backend address (`environment: "static"`, every URL empty). To point a
deployment at a backend, write its address at deploy time:

```sh
node scripts/set_api_base.mjs https://your-api-domain.example --env production
# optional second backend for the "Staging" button:
node scripts/set_api_base.mjs https://your-api-domain.example --env production --staging https://staging-api.example
```

The script accepts only `https://` addresses, or a loopback address for local testing. Browsers block
`http://` requests from a page served over HTTPS. Do not commit a private, mesh-network or loopback
address; `scripts/prepublish_scan.mjs` fails if one is present.

## Host on GitHub Pages

1. Repository: `https://github.com/tensorrent/OmniForge-Game-Engine-Transpiler`
2. Check the tree:
   ```sh
   node tests/verify_landing.mjs
   node scripts/prepublish_scan.mjs
   ```
3. In GitHub **Settings -> Pages**, select **GitHub Actions** (uses `.github/workflows/deploy-pages.yml`),
   or **Deploy from a branch -> `main` -> `/ (root)`**. Pick one; with both, every push deploys twice.
   Every asset URL (`./assets/...`, `./config.js`, `./privacy.html`) is relative, so the site works on
   an apex custom domain and on `https://<org>.github.io/<repo>/` subpaths.

## Verify locally

```sh
node tests/verify_landing.mjs
node scripts/prepublish_scan.mjs
python3 -m http.server 8085 --bind 127.0.0.1
```

`scripts/prepublish_scan.mjs` can also check private literals (names, addresses) that must never be
published. List them one per line in an untracked `.prepublish-private` file at the repository root;
see `.prepublish-private.example`. Git ignores the real file.

## Third-party components

The `.sprz` package format and parts of the conversion SDK come from the third-party SPROUT project.
SPROUT is not a TensorRent product. Some technical identifiers still carry its name (for example the
`X-Sprout-*` HTTP headers, the `@sprout/bussing-sdk` package and the `pnpm sprout:*` scripts shown in
the developer snippets), because the backend and SDK use them.

---
© 2026 Bradley Wallace / TensorRent — SIP License v1.1. Source-available; see the
[licence text](./LICENSE.txt). OmniForge is a TensorRent project; TensorRent is a research division of KOBA42.
