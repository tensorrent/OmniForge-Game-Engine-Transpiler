#!/usr/bin/env node
// Writes config.js with a backend address chosen at deploy time.
// Usage: node scripts/set_api_base.mjs <url> [--env production|staging|local] [--staging <url>]
// The URL is required and must start with https://, or be a loopback address for local testing
// (http://127.0.0.1[:port] or http://localhost[:port]). Private network and mesh addresses are
// refused even over https. Do not commit a config.js that points at a loopback address:
// scripts/prepublish_scan.mjs fails on it.
import fs from "node:fs";
import path from "node:path";

const USAGE =
  "Usage: node scripts/set_api_base.mjs <https://your-backend-url> [--env production|staging|local] [--staging <https://url>]";

const args = process.argv.slice(2);
const apiUrl = args[0];
if (!apiUrl || apiUrl.startsWith("-")) {
  console.error(USAGE);
  process.exit(2);
}

function flagValue(name) {
  const i = args.indexOf(name, 1);
  if (i < 0) return null;
  const v = args[i + 1];
  if (!v || v.startsWith("-")) {
    console.error(`${name} needs a value.\n${USAGE}`);
    process.exit(2);
  }
  return v;
}

const LOOPBACK = /^http:\/\/(127\.0\.0\.1|localhost)(:\d{1,5})?(\/.*)?$/i;
const PRIVATE_HOST =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}|.+\.ts\.net|.+\.local|.+\.lan|.+\.internal)$/i;

function checkUrl(label, value) {
  const url = value.replace(/\/+$/, "");
  if (LOOPBACK.test(url)) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    parsed = null;
  }
  if (!parsed || parsed.protocol !== "https:" || !url.toLowerCase().startsWith("https://")) {
    console.error(`${label} must start with https:// (or be http://127.0.0.1 or http://localhost for local testing).`);
    process.exit(2);
  }
  if (PRIVATE_HOST.test(parsed.hostname)) {
    console.error(`${label} points at a private network or mesh host; the public site cannot reach it.`);
    process.exit(2);
  }
  return url;
}

const envName = flagValue("--env") ?? "production";
const base = checkUrl("The backend URL", apiUrl);
const stagingRaw = flagValue("--staging");
const staging = stagingRaw ? checkUrl("The --staging URL", stagingRaw) : "";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const cfgPath = path.join(root, "config.js");
const content = `// Deploy-time settings for the OmniForge site, written by scripts/set_api_base.mjs.
window.OMNIFORGE_CONFIG = window.SPROUT_SPRZ_CONFIG = {
  environment: ${JSON.stringify(envName)},
  apiBaseUrl: ${JSON.stringify(base)},
  stagingApiBaseUrl: ${JSON.stringify(staging)},
  localApiBaseUrl: ""
};
`;
fs.writeFileSync(cfgPath, content, "utf8");
const loopbackNote = LOOPBACK.test(base) || LOOPBACK.test(staging) ? " (loopback: for local testing only, do not commit)" : "";
console.log(`Updated config.js: environment=${envName}, apiBaseUrl set${staging ? ", stagingApiBaseUrl set" : ""}${loopbackNote}.`);
