#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const requiredFiles = ["index.html", "privacy.html", "config.js", ".nojekyll", "LICENSE", "README.md"];
const issues = [];

for (const f of requiredFiles) {
  if (!fs.existsSync(path.join(root, f))) {
    issues.push(`Missing required file: ${f}`);
  }
}

const assetsDir = path.join(root, "assets");
if (!fs.existsSync(assetsDir) || fs.readdirSync(assetsDir).length === 0) {
  issues.push("Missing compiled assets/ bundle.");
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else if (ent.isFile()) {
      const rel = path.relative(root, full);
      if (rel === "scripts/prepublish_scan.mjs") continue;
      if (ent.name.startsWith(".env") && ent.name !== ".env.example") {
        issues.push(`Forbidden secret env file in publish tree: ${rel}`);
      }
      if (/\.db$|\.sqlite$|\.pem$|\.key$|^id_rsa|^id_ed25519/i.test(ent.name)) {
        issues.push(`Forbidden database or key file in publish tree: ${rel}`);
      }
      if (/\.(ts|tsx)$/i.test(ent.name) && !rel.startsWith("tests/")) {
        issues.push(`IP check: uncompiled .ts/.tsx source detected in GitHub Pages tree: ${rel}`);
      }
      if (/\.(html|js|mjs|css|md|yml|yaml)$/i.test(ent.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (text.includes("PRIVATE KEY-----")) {
          issues.push(`Private key marker detected in ${rel}`);
        }
        if (text.includes("/Users/") || text.includes("/home/ubuntu/")) {
          issues.push(`Local host filesystem path leak in ${rel}`);
        }
      }
    }
  }
}

walk(root);

if (issues.length > 0) {
  console.error("PREPUBLISH SCAN FAILED:\n" + issues.map((x) => ` - ${x}`).join("\n"));
  process.exit(1);
}

console.log("✅ PREPUBLISH SCAN PASSED: zero secret/IP/path leaks, static Pages bundle clean.");
