# SPROUT `.sprz` Universal Conversion Platform — GitHub Pages Landing

Static production web distribution for **SPROUT `.sprz` Universal Game & Content Conversion Service** — engineered for instant **GitHub Pages** hosting with zero uncompiled backend/SDK source code inside this public repository.

## Intellectual Property & Architecture Separation

- **Public Static Repo (here):** Contains only the minified static client bundle (`index.html`, `assets/*`, `config.js`), privacy notice (`privacy.html`), and deployment config licensed under **[Sovereign Integrity Protocol License (SIP License v1.1)](./LICENSE)** (`© 2026 Bradley Wallace / TensorRent`).
- **Private / Meshnet Backend (Supermicro `100.108.193.6:18788`):** Hosts SQLite-backed conversion jobs (`/v1/jobs`), customer CRM (`/v1/customers`), classic catalog (`/v1/classic-info`), and marketing funnel services (`/v1/marketing/*`).

## Host Directly on GitHub Pages

1. Create a new repository on GitHub (e.g., `tensorrent/sprout-sprz-landing`).
2. Optionally update the production API base URL before pushing:
   ```sh
   node scripts/set_api_base.mjs https://your-api-domain.example --env production
   node tests/verify_landing.mjs
   node scripts/prepublish_scan.mjs
   ```
3. Push to GitHub:
   ```sh
   git remote add origin https://github.com/<your-org>/<your-repo>.git
   git push -u origin main
   ```
4. In GitHub **Settings -> Pages**:
   - Select **GitHub Actions** (uses `.github/workflows/deploy-pages.yml`), **or** select **Deploy from a branch -> `main` -> `/ (root)`**.
   - Every asset URL (`./assets/...`, `./config.js`, `./privacy.html`) is strictly relative so it works on both apex custom domains and `https://<org>.github.io/<repo>/` subpaths.

## Verify Locally Before Push

```sh
node tests/verify_landing.mjs
node scripts/prepublish_scan.mjs
python3 -m http.server 8085 --bind 127.0.0.1
```

---
© 2026 Bradley Wallace / TensorRent — Governed by [SIP License v1.1](./LICENSE).
