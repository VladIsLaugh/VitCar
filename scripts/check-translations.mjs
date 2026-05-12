import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../apps/web/messages');

const uk = JSON.parse(readFileSync(join(messagesDir, 'uk.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? getKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

const ukKeys = new Set(getKeys(uk));
const enKeys = new Set(getKeys(en));

const missingInEn = [...ukKeys].filter((k) => !enKeys.has(k));
const missingInUk = [...enKeys].filter((k) => !ukKeys.has(k));

if (missingInEn.length || missingInUk.length) {
  if (missingInEn.length) {
    console.error('Keys in uk.json but missing in en.json:');
    missingInEn.forEach((k) => console.error(`  - ${k}`));
  }
  if (missingInUk.length) {
    console.error('Keys in en.json but missing in uk.json:');
    missingInUk.forEach((k) => console.error(`  - ${k}`));
  }
  process.exit(1);
}

console.log(`✓ Translation parity OK (${ukKeys.size} keys)`);
