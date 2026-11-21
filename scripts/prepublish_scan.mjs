#!/usr/bin/env node
// Pre-publish scan for the static GitHub Pages tree. Exits 1 if any check finds a problem.
//
// Checks, in every file of the tree except .git, node_modules, this script and .prepublish-private:
//  1. required files and the compiled assets/ bundle are present;
//  2. no .env files, databases or key files; no uncompiled .ts/.tsx source;
//  3. in text files: private-key markers; local filesystem paths;
//  4. private network addresses: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 100.64.0.0/10;
//  5. loopback addresses with a port (127.x.x.x, localhost, [::1], 0.0.0.0). The compiled bundle may
//     keep the loopback ports listed in BUNDLE_LOOPBACK_PORTS (its local developer mode, until the
//     source is fixed); they are reported, not failed. Any loopback address elsewhere fails;
//  6. email addresses at personal-mailbox providers (gmail.com, icloud.com, outlook.com and others);
//  7. machine and mesh host names: *.ts.net, *.local, *.lan, *.internal, *.home.arpa, hardware model
//     names used as host names (Supermicro, MacBook, Mac mini and others), and the names of the
//     computer running the scan (host name; on macOS also the computer name and local host name;
//     the login name), read at scan time and never stored;
//  8. private literals listed one per line in the untracked file .prepublish-private at the repo root
//     (blank lines and lines starting with # are skipped; matched case-insensitively). Without that
//     file this check is skipped and the output says so. The file must not be tracked by git.
// Findings never print the matched private value, only the file, line and class.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const requiredFiles = ["index.html", "privacy.html", "config.js", ".nojekyll", "LICENSE", "LICENSE.txt", "THIRD_PARTY_NOTICES.md", "README.md"];
const PRIVATE_FILE = ".prepublish-private";
const SELF = "scripts/prepublish_scan.mjs";
const BUNDLE_LOOPBACK_PORTS = new Set(["8788", "19100", "3030"]);
const TEXT_EXT = /\.(html?|js|mjs|cjs|css|md|txt|json|ya?ml|svg|xml|example)$/i;
const issues = [];
const notes = [];
const bundleLoopbacks = new Set();

for (const f of requiredFiles) {
  if (!fs.existsSync(path.join(root, f))) issues.push(`Missing required file: ${f}`);
}
const assetsDir = path.join(root, "assets");
if (!fs.existsSync(assetsDir) || !fs.readdirSync(assetsDir).some((n) => n.endsWith(".js"))) {
  issues.push("Missing compiled assets/ bundle.");
}

// Class 4: private network ranges. The lookarounds keep version strings such as 1.10.2.3.4 out.
const PRIVATE_NET = [
  ["10.0.0.0/8", /(?<![\d.])10\.\d{1,3}\.\d{1,3}\.\d{1,3}(?!\d|\.\d)/g],
  ["172.16.0.0/12", /(?<![\d.])172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(?!\d|\.\d)/g],
  ["192.168.0.0/16", /(?<![\d.])192\.168\.\d{1,3}\.\d{1,3}(?!\d|\.\d)/g],
  ["100.64.0.0/10", /(?<![\d.])100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}(?!\d|\.\d)/g],
];
// Class 5: loopback with a port.
const LOOPBACK_PORT = /(?<![\w.])(?:127\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost|\[::1\]|0\.0\.0\.0):(\d{1,5})/gi;
// Class 6: personal mailboxes.
const PERSONAL_MAIL =
  /[A-Za-z0-9._%+-]+@(?:gmail|googlemail|icloud|me|mac|yahoo|ymail|rocketmail|outlook|hotmail|live|msn|aol|proton|protonmail|pm|gmx|yandex|zoho|fastmail|hey|tutanota|tuta|duck)\.(?:com|me|ch|net|de|ru|io|co\.uk|fr)\b/gi;
// Class 7: machine and mesh host names.
const HOST_SUFFIX = /\b[a-z0-9-]+\.(?:ts\.net|local|lan|internal|home\.arpa)\b/gi;
const HARDWARE_NAME = /\b(?:Supermicro|MacBook(?:[- ]?(?:Pro|Air))?|Mac[- ]?mini|Mac[- ]?Studio|iMac|ThinkPad|Raspberry[- ]?Pi)\b/g;

function machineNames() {
  const names = new Set();
  const add = (v) => {
    const s = String(v ?? "").trim().replace(/\.local$/i, "");
    if (s.length >= 4 && !/^(localhost|runner|ubuntu|admin|user|root)$/i.test(s)) names.add(s);
  };
  try { add(os.hostname()); } catch {}
  try { add(os.userInfo().username); } catch {}
  if (process.platform === "darwin") {
    for (const key of ["ComputerName", "LocalHostName"]) {
      try { add(execFileSync("scutil", ["--get", key], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })); } catch {}
    }
  }
  return [...names];
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const machineRes = machineNames().map((n) => new RegExp(`(?<![A-Za-z0-9])${escapeRe(n).replace(/[-_ ]/g, "[-_ ]?")}(?![A-Za-z0-9])`, "i"));

let privateLiterals = null;
const privatePath = path.join(root, PRIVATE_FILE);
if (fs.existsSync(privatePath)) {
  privateLiterals = fs
    .readFileSync(privatePath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.toLowerCase());
  try {
    execFileSync("git", ["-C", root, "ls-files", "--error-unmatch", PRIVATE_FILE], { stdio: "ignore" });
    issues.push(`${PRIVATE_FILE} is tracked by git; it must stay untracked (add it to .gitignore and git rm --cached it).`);
  } catch {}
} else {
  notes.push(`${PRIVATE_FILE} not found: the private-literal check (8) was skipped.`);
}

function lineOf(text, index) {
  let n = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function scanText(rel, text) {
  const isBundle = rel.startsWith("assets/") && rel.endsWith(".js");
  if (text.includes("PRIVATE KEY-----")) issues.push(`Private key marker in ${rel}`);
  if (text.includes("/Users/") || text.includes("/home/")) issues.push(`Local filesystem path in ${rel}`);
  for (const [label, re] of PRIVATE_NET) {
    for (const m of text.matchAll(re)) issues.push(`Private network address (${label}) in ${rel}:${lineOf(text, m.index)}`);
  }
  for (const m of text.matchAll(LOOPBACK_PORT)) {
    if (isBundle && BUNDLE_LOOPBACK_PORTS.has(m[1])) bundleLoopbacks.add(m[1]);
    else issues.push(`Loopback address with port ${m[1]} in ${rel}:${lineOf(text, m.index)}`);
  }
  for (const m of text.matchAll(PERSONAL_MAIL)) issues.push(`Personal-mailbox email address in ${rel}:${lineOf(text, m.index)}`);
  for (const m of text.matchAll(HOST_SUFFIX)) issues.push(`Machine or mesh host name in ${rel}:${lineOf(text, m.index)}`);
  for (const m of text.matchAll(HARDWARE_NAME)) issues.push(`Hardware model used as a machine name ("${m[0]}") in ${rel}:${lineOf(text, m.index)}`);
  for (const re of machineRes) {
    const m = re.exec(text);
    if (m) issues.push(`Name of this computer or its login in ${rel}:${lineOf(text, m.index)}`);
  }
  if (privateLiterals) {
    const lower = text.toLowerCase();
    privateLiterals.forEach((lit, i) => {
      const at = lower.indexOf(lit);
      if (at >= 0) issues.push(`Private literal #${i + 1} from ${PRIVATE_FILE} in ${rel}:${lineOf(text, at)}`);
    });
  }
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const full = path.join(dir, ent.name);
    const rel = path.relative(root, full).split(path.sep).join("/");
    if (ent.isDirectory()) {
      walk(full);
      continue;
    }
    if (!ent.isFile() || rel === SELF || rel === PRIVATE_FILE) continue;
    if (ent.name.startsWith(".env") && ent.name !== ".env.example") issues.push(`Forbidden env file in publish tree: ${rel}`);
    if (/\.db$|\.sqlite3?$|\.pem$|\.key$|\.p12$|^id_rsa|^id_ed25519/i.test(ent.name)) issues.push(`Forbidden database or key file in publish tree: ${rel}`);
    if (/\.(ts|tsx)$/i.test(ent.name) && !rel.startsWith("tests/")) issues.push(`Uncompiled .ts/.tsx source in publish tree: ${rel}`);
    if (TEXT_EXT.test(ent.name) || !path.extname(ent.name) || ent.name.startsWith(".")) {
      scanText(rel, fs.readFileSync(full, "utf8"));
    }
  }
}

walk(root);

const checked = [
  "required files and compiled bundle",
  ".env, database and key files",
  "uncompiled .ts/.tsx source",
  "private-key markers",
  "local filesystem paths",
  "private network addresses (10/8, 172.16/12, 192.168/16, 100.64/10)",
  "loopback addresses with a port",
  "personal-mailbox email addresses",
  "machine and mesh host names (patterns and this computer's names)",
  privateLiterals ? `${privateLiterals.length} private literal(s) from ${PRIVATE_FILE}` : null,
].filter(Boolean);

for (const n of notes) console.log(`note: ${n}`);
if (bundleLoopbacks.size > 0) {
  console.log(`note: the compiled bundle still contains loopback ports ${[...bundleLoopbacks].sort().join(", ")} (local developer mode); allowed until the source fix removes them.`);
}
if (issues.length > 0) {
  console.error(`PREPUBLISH SCAN FAILED (${issues.length}):\n` + issues.map((x) => ` - ${x}`).join("\n"));
  process.exit(1);
}
console.log(`PREPUBLISH SCAN PASSED. Checked: ${checked.join("; ")}.`);
