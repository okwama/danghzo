#!/usr/bin/env node
/**
 * Test script: Login and call /dashboard/summary
 *
 * Requirements: Node.js v18+ (built-in fetch)
 * Usage examples:
 *   node scripts/test_dashboard_summary.js --base http://localhost:3000 --phone 0706166875 --password password
 *   node scripts/test_dashboard_summary.js --base http://localhost:3000 --phone 0706166875 --password password --date 2025-09-23
 *   node scripts/test_dashboard_summary.js --base http://localhost:3000 --phone 0706166875 --password password --userId 123
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_BASE = process.env.API_BASE || 'http://localhost:3000/api';

// Lightweight .env loader (only KEY=VALUE lines, ignores comments/blanks)
function loadEnvFromDotenv(dotenvPath) {
  try {
    if (!fs.existsSync(dotenvPath)) return;
    const content = fs.readFileSync(dotenvPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Remove optional surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch (_) {
    // Silently ignore .env read errors
  }
}

// Load .env from current working directory and from script directory as fallback
const cwdEnvPath = path.join(process.cwd(), '.env');
const scriptEnvPath = path.join(__dirname, '.env');
loadEnvFromDotenv(cwdEnvPath);
if (scriptEnvPath !== cwdEnvPath) {
  loadEnvFromDotenv(scriptEnvPath);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key.startsWith('--')) {
      const k = key.slice(2);
      if (val && !val.startsWith('--')) {
        args[k] = val;
        i++;
      } else {
        args[k] = true;
      }
    }
  }
  return args;
}

function resolveDate(args) {
  if (args.date) return args.date;
  const tz = args.tz || process.env.TIMEZONE || 'Africa/Nairobi';
  try {
    // en-CA gives YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  } catch (_) {
    // Fallback to local timezone if Intl fails
    return new Date().toLocaleDateString('en-CA');
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const base = args.base || DEFAULT_BASE;
  const phoneNumber = args.phone || process.env.PHONE;
  const password = args.password || process.env.PASSWORD;
  const date = resolveDate(args);
  const providedUserId = args.userId ? Number(args.userId) : undefined;

  if (!phoneNumber || !password) {
    console.error('Missing credentials. Provide via --phone and --password or env PHONE and PASSWORD');
    process.exit(1);
  }

  console.log(`Base URL: ${base}`);
  console.log(`Date: ${date}`);

  // 1) Login
  const loginUrl = `${base.replace(/\/$/, '')}/auth/login`;
  console.log(`\n➡️  Logging in: POST ${loginUrl}`);

  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, password })
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error(`Login failed (${loginRes.status}): ${text}`);
    process.exit(1);
  }

  const loginJson = await loginRes.json();
  const token = loginJson.accessToken;
  const salesRep = loginJson.salesRep || {};
  const userId = providedUserId ?? salesRep.id;

  if (!token) {
    console.error('No accessToken returned from login response.');
    console.error(JSON.stringify(loginJson, null, 2));
    process.exit(1);
  }

  if (!userId) {
    console.error('Could not determine userId (no --userId and no salesRep.id in login response).');
    console.error(JSON.stringify(loginJson, null, 2));
    process.exit(1);
  }

  console.log('✅ Login successful');
  console.log(`User ID: ${userId}`);

  // 2) Call dashboard summary
  const summaryUrl = `${base.replace(/\/$/, '')}/dashboard/summary?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`;
  console.log(`\n➡️  Fetching dashboard summary: GET ${summaryUrl}`);

  const summaryRes = await fetch(summaryUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!summaryRes.ok) {
    const text = await summaryRes.text();
    console.error(`Summary call failed (${summaryRes.status}): ${text}`);
    process.exit(1);
  }

  const summaryJson = await summaryRes.json();
  console.log('\n✅ Summary response:');
  console.log(JSON.stringify(summaryJson, null, 2));
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
