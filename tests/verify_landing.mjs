#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const configJs = fs.readFileSync(path.join(root, "config.js"), "utf8");

assert.ok(indexHtml.includes("./config.js"), "index.html must reference relative ./config.js");
assert.ok(!/src="\/assets\//.test(indexHtml), "index.html must use relative ./assets/ paths for GitHub Pages subpath safety");
assert.ok(!/href="\/assets\//.test(indexHtml), "index.html CSS link must use relative ./assets/ path");
assert.ok(configJs.includes("SPROUT_SPRZ_CONFIG"), "config.js must define window.SPROUT_SPRZ_CONFIG");

const assetRefs = [...indexHtml.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
assert.ok(assetRefs.length >= 2, "Expected compiled JS and CSS assets in index.html");
for (const ref of assetRefs) {
  const diskPath = path.join(root, ref.replace(/^\.\//, ""));
  assert.ok(fs.existsSync(diskPath), `Missing referenced asset: ${diskPath}`);
  assert.ok(fs.statSync(diskPath).size > 100, `Asset unexpectedly empty: ${diskPath}`);
}

console.log(`✅ VERIFY LANDING PASSED (${assetRefs.length} compiled assets verified, relative Pages paths valid).`);
