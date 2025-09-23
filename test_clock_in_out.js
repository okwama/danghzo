#!/usr/bin/env node
/**
 * Test script: Clock In and Clock Out via API
 *
 * Requirements: Node.js v18+ (built-in fetch)
 * Usage examples:
 *   node test_clock_in_out.js --base http://localhost:3000/api --phone 0706166875 --password password --time "2025-09-23 09:15:00"
 *   node test_clock_in_out.js --base http://localhost:3000/api --time now --action in
 *   node test_clock_in_out.js --base http://localhost:3000/api --time now --action out
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_BASE = process.env.API_BASE || 'http://localhost:3000/api';

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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    });
  } catch (_) {}
}

const cwdEnvPath = path.join(process.cwd(), '.env');
const scriptEnvPath = path.join(__dirname, '.env');
loadEnvFromDotenv(cwdEnvPath);
if (scriptEnvPath !== cwdEnvPath) loadEnvFromDotenv(scriptEnvPath);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key.startsWith('--')) {
      const k = key.slice(2);
      if (val && !val.startsWith('--')) {
        args[k] = val; i++;
      } else {
        args[k] = true;
      }
    }
  }
  return args;
}

function nowNairobi() {
  try {
    const d = new Date();
    const f = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(d);
    const get = (t) => f.find(p => p.type === t)?.value;
    const ts = `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
    return ts;
  } catch {
    const local = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())} ${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}`;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const base = args.base || DEFAULT_BASE;
  const phoneNumber = args.phone || process.env.PHONE;
  const password = args.password || process.env.PASSWORD;
  const action = (args.action || 'in').toLowerCase(); // 'in' or 'out'
  let clientTime = args.time;
  if (!clientTime || clientTime === 'now') clientTime = nowNairobi();

  if (!phoneNumber || !password) {
    console.error('Missing credentials. Provide via --phone and --password or env PHONE and PASSWORD');
    process.exit(1);
  }

  console.log(`Base URL: ${base}`);
  console.log(`Action: ${action}`);
  console.log(`Client Time (Africa/Nairobi): ${clientTime}`);

  // 1) Login
  const loginUrl = `${base.replace(/\/$/, '')}/auth/login`;
  console.log(`\n➡️  Logging in: POST ${loginUrl}`);
  const loginRes = await fetch(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber, password }) });
  if (!loginRes.ok) { console.error('Login failed', await loginRes.text()); process.exit(1); }
  const loginJson = await loginRes.json();
  const token = loginJson.accessToken;
  const userId = loginJson?.salesRep?.id;
  if (!token || !userId) { console.error('Missing token or userId'); console.error(loginJson); process.exit(1); }
  console.log('✅ Login successful');

  // 2) Call clock-in or clock-out
  const endpoint = action === 'out' ? 'clock-out' : 'clock-in';
  const url = `${base.replace(/\/$/, '')}/clock-in-out/${endpoint}`;
  console.log(`\n➡️  Calling ${endpoint.toUpperCase()}: POST ${url}`);
  const body = { userId, clientTime };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    console.error(`${endpoint} failed (${res.status}): ${text}`);
    process.exit(1);
  }
  console.log(`\n✅ ${endpoint.toUpperCase()} response:`);
  try { console.log(JSON.parse(text)); } catch { console.log(text); }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1); });
