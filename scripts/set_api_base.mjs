#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const apiUrl = args.find((a) => !a.startsWith("-"));
if (!apiUrl) {
  console.error("Usage: node scripts/set_api_base.mjs <https://your-backend-url> [--env production|staging|local]");
  process.exit(1);
}
const envIdx = args.indexOf("--env");
const envName = envIdx >= 0 && args[envIdx + 1] ? args[envIdx + 1] : "production";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const cfgPath = path.join(root, "config.js");
const content = `window.SPROUT_SPRZ_CONFIG = {
  environment: ${JSON.stringify(envName)},
  apiBaseUrl: ${JSON.stringify(apiUrl.replace(/\/$/, ""))},
  stagingApiBaseUrl: "http://100.108.193.6:18788",
  localApiBaseUrl: "http://127.0.0.1:8788"
};
`;
fs.writeFileSync(cfgPath, content, "utf8");
console.log(`Updated ${cfgPath} -> environment=${envName}, apiBaseUrl=${apiUrl}`);
