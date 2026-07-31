#!/usr/bin/env node
/**
 * check-i18n.js
 *
 * Verifies that apps/web/messages/uk.json and apps/web/messages/en.json
 * have identical top-level keys. Exits 1 (with a clear error listing the
 * missing keys) on mismatch. Plain Node, no dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');

const MESSAGES_DIR = path.join(__dirname, '..', 'apps', 'web', 'messages');
const LOCALES = ['uk', 'en'];

function loadTopLevelKeys(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`[check-i18n] Cannot read ${filePath}: ${err.message}`);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[check-i18n] Invalid JSON in ${filePath}: ${err.message}`);
    process.exit(1);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    console.error(`[check-i18n] ${filePath} must contain a JSON object at the top level.`);
    process.exit(1);
  }
  return Object.keys(data);
}

const keysByLocale = Object.fromEntries(LOCALES.map((l) => [l, loadTopLevelKeys(l)]));

let failed = false;
for (let i = 0; i < LOCALES.length; i++) {
  for (let j = i + 1; j < LOCALES.length; j++) {
    const a = LOCALES[i];
    const b = LOCALES[j];
    const missingInB = keysByLocale[a].filter((k) => !keysByLocale[b].includes(k));
    const missingInA = keysByLocale[b].filter((k) => !keysByLocale[a].includes(k));
    if (missingInB.length > 0 || missingInA.length > 0) {
      failed = true;
      console.error(`[check-i18n] Top-level key mismatch between ${a}.json and ${b}.json:`);
      if (missingInB.length > 0) {
        console.error(`  Missing in ${b}.json: ${missingInB.join(', ')}`);
      }
      if (missingInA.length > 0) {
        console.error(`  Missing in ${a}.json: ${missingInA.join(', ')}`);
      }
    }
  }
}

if (failed) {
  console.error('[check-i18n] FAILED — add the missing keys to BOTH locale files.');
  process.exit(1);
}

console.log(
  `[check-i18n] OK — ${LOCALES.map((l) => `${l}.json`).join(' and ')} have identical top-level keys (${keysByLocale[LOCALES[0]].length} keys).`
);
