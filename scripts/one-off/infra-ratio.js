#!/usr/bin/env node
/**
 * infra-ratio.js
 *
 * Fills Companies.Infra Ratio from GetLeads free counts. No contacts pulled,
 * no People rows written, 0 credits.
 *
 * Per company, using its Domain, three count_contacts calls:
 *   1. total   -> if 0, GetLeads does not know the company: LEAVE BLANK, give up on the row.
 *   2. infra   -> infrastructure-titled contacts
 *   3. eng     -> engineering-titled contacts (infra titles are a subset of these)
 * Writes `infra:dev` where dev = eng - infra, e.g. "0:14".
 *
 * BLANK MEANS UNKNOWN, NEVER LEAN. Dwayne's dialed file recorded 274 companies
 * as "No Infra Owner" purely because the lookup returned nothing; ~12% of his
 * dials went out on that mistake. This script refuses to repeat it.
 *
 * Auth: GETLEADS_API_KEY or ~/.config/rootworks/getleads-api-key
 *       AIRTABLE_API_KEY  or ~/.config/rootworks/airtable-api-key
 *
 * Usage:
 *   node scripts/infra-ratio.js --base appyhuYMwaGUdIs3z --table Companies --view "Andy ratio source"
 *   node scripts/infra-ratio.js ... --limit 25          # pilot on the first 25
 *   node scripts/infra-ratio.js ... --dry               # count, print, write nothing
 *   node scripts/infra-ratio.js ... --force             # also redo rows that already have a ratio
 */

const fs = require('fs');
const path = require('path');

// ---------- config ----------

const INFRA_TITLES = [
  'DevOps', 'Dev Ops', 'SRE', 'Site Reliability', 'Reliability Engineer',
  'Infrastructure', 'Infra Engineer', 'Infra Lead',
  'Platform Engineer', 'Platform Engineering', 'Platform Lead',
  'Cloud Engineer', 'Cloud Architect', 'Cloud Infrastructure', 'Cloud Operations',
  'Systems Engineer', 'System Engineer', 'Systems Architect',
  'System Administrator', 'Systems Administrator', 'Sysadmin',
  'Production Engineer', 'Release Engineer', 'Build Engineer',
  'Kubernetes', 'Network Engineer', 'Automation Engineer',
  'Observability', 'IT Operations', 'Technical Operations', 'Site Operations',
];

const ENG_TITLES = [
  'Engineer', 'Engineering', 'Developer', 'Development',
  'Architect', 'Programmer', 'Software',
  'Full Stack', 'Fullstack', 'Backend', 'Back End', 'Frontend', 'Front End',
  'SDET', 'Technical Lead', 'Tech Lead',
];

// Free exact count. Verified 2026-09-09: returns {ok, total_matching, credits_used:0}.
// NOT /contacts/search — that one bills 1 credit per record returned.
const GL_REST = 'https://app.getleads.io/api/v1/contacts/search/count';
const AT_URL = 'https://api.airtable.com/v0';
const RATIO_FIELD = 'Infra Ratio';
const DOMAIN_FIELD = 'Domain';

// GetLeads rate-limits hard. Measured 2026-09-09: 4 workers at 150ms produced a
// steady stream of 429s and the run crawled. 2 workers at 700ms is about 3 calls
// a second and runs clean.
const CONCURRENCY = 2;        // companies in flight
const PAUSE_MS = 700;         // between GetLeads calls in a worker
const WRITE_CHUNK = 10;       // Airtable PATCH cap
let throttleUntil = 0;        // global cooldown, set whenever any worker sees a 429

// ---------- args ----------

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf('--' + name);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes('--' + name);

const BASE = arg('base', 'appyhuYMwaGUdIs3z');
const TABLE = arg('table', 'Companies');
const VIEW = arg('view', 'Andy ratio source');
const LIMIT = arg('limit') ? parseInt(arg('limit'), 10) : Infinity;
const DRY = flag('dry');
const FORCE = flag('force');

// ---------- auth ----------

function secret(envName, fileName) {
  if (process.env[envName]) return process.env[envName].trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', fileName);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  console.error(`Missing credential: set ${envName} or write ~/.config/rootworks/${fileName}`);
  process.exit(1);
}

const GL_KEY = secret('GETLEADS_API_KEY', 'getleads-api-key');
const AT_KEY = secret('AIRTABLE_API_KEY', 'airtable-api-key');

// ---------- helpers ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait out any global cooldown a 429 put us in.
async function respectThrottle() {
  while (Date.now() < throttleUntil) await sleep(Math.min(throttleUntil - Date.now(), 1000));
}

async function retry(fn, label, tries = 7) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      await respectThrottle();
      return await fn();
    } catch (e) {
      last = e;
      // A 429 is not a normal error: back off long and stop every worker, not just this one.
      const rateLimited = e.rateLimited || /429|too many requests/i.test(e.message);
      const wait = rateLimited ? Math.min(5000 * Math.pow(2, i), 120000) : 800 * Math.pow(2, i);
      if (rateLimited) throttleUntil = Math.max(throttleUntil, Date.now() + wait);
      console.error(`  retry ${i + 1}/${tries} ${label}: ${e.message.slice(0, 80)} (waiting ${wait}ms)`);
      await sleep(wait);
    }
  }
  throw last;
}

// GetLeads free exact count. Returns total_matching.
async function glCount(domain, jobTitles, excludeTitles) {
  const body = { domains: [domain] };
  if (jobTitles) body.job_titles = jobTitles;
  if (excludeTitles) body.exclude_job_titles = excludeTitles;

  const res = await fetch(GL_REST, {
    method: 'POST',
    headers: {
      'x-api-key': GL_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`GetLeads ${res.status}: ${text.slice(0, 120)}`);
    if (res.status === 429 || /too many requests/i.test(text)) err.rateLimited = true;
    throw err;
  }
  const json = await res.json();
  if (typeof json.total_matching !== 'number') {
    throw new Error(`GetLeads: no total_matching in ${JSON.stringify(json).slice(0, 200)}`);
  }
  if (json.credits_used) console.error(`  !! credits_used=${json.credits_used} on ${domain}`);
  return json.total_matching;
}

async function atGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AT_KEY}` } });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function atPatch(records) {
  const res = await fetch(`${AT_URL}/${BASE}/${encodeURIComponent(TABLE)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

// ---------- read the view ----------

async function readView() {
  const out = [];
  let offset;
  do {
    const params = new URLSearchParams({ view: VIEW, pageSize: '100' });
    params.append('fields[]', DOMAIN_FIELD);
    params.append('fields[]', RATIO_FIELD);
    if (offset) params.set('offset', offset);
    const page = await retry(
      () => atGet(`${AT_URL}/${BASE}/${encodeURIComponent(TABLE)}?${params}`),
      'read view'
    );
    for (const r of page.records) {
      out.push({
        id: r.id,
        domain: (r.fields[DOMAIN_FIELD] || '').trim().toLowerCase(),
        existing: r.fields[RATIO_FIELD] || '',
      });
    }
    offset = page.offset;
    process.stderr.write(`\r  read ${out.length} companies…`);
  } while (offset && out.length < LIMIT);
  process.stderr.write('\n');
  return out.slice(0, LIMIT === Infinity ? out.length : LIMIT);
}

// ---------- the pass ----------

async function ratioFor(company) {
  const { domain } = company;
  if (!domain) return { skip: 'no domain' };

  // Two calls, not three. The coverage check only matters when both counts come
  // back 0, because that is the only case where "no infra people" is
  // indistinguishable from "GetLeads has never heard of this company". Most
  // companies have at least one engineer, so the third call is usually wasted:
  // skipping it cuts roughly a third of the requests and the rate limiting with it.
  const infra = await retry(() => glCount(domain, INFRA_TITLES), `infra ${domain}`);
  await sleep(PAUSE_MS);
  // Devs = engineering titles with every infra title EXCLUDED at the source.
  // Do not compute this as eng - infra: infra titles like Sysadmin, Kubernetes,
  // Observability and IT Operations contain no engineering word, so they are
  // never in the engineering count and subtracting them removes people who were
  // never counted, pushing the dev number too low.
  const dev = await retry(() => glCount(domain, ENG_TITLES, INFRA_TITLES), `dev ${domain}`);
  await sleep(PAUSE_MS);

  let total = infra + dev;
  if (infra === 0 && dev === 0) {
    // Ambiguous: either a genuinely tech-less company, or one GetLeads does not
    // hold at all. Only here is the coverage call worth making.
    total = await retry(() => glCount(domain, null), `total ${domain}`);
    await sleep(PAUSE_MS);
    if (total === 0) return { skip: 'not in getleads' };  // give up, leave blank
  }

  return { ratio: `${infra}:${dev}`, total, infra, dev };
}

async function main() {
  console.log(`Base ${BASE} | table ${TABLE} | view "${VIEW}"${DRY ? ' | DRY RUN' : ''}`);

  const all = await readView();
  const todo = FORCE ? all : all.filter((c) => !c.existing);
  console.log(`${all.length} in view, ${todo.length} to do${FORCE ? ' (forced)' : ' (skipping ones already filled)'}\n`);

  const stats = { written: 0, blank_notfound: 0, blank_nodomain: 0, failed: 0, noInfra: 0, hasInfra: 0 };
  const pending = [];
  let cursor = 0;

  async function flush(force) {
    while (pending.length >= WRITE_CHUNK || (force && pending.length)) {
      const chunk = pending.splice(0, WRITE_CHUNK);
      if (DRY) { stats.written += chunk.length; continue; }
      await retry(() => atPatch(chunk), 'patch');
      stats.written += chunk.length;
    }
  }

  async function worker(n) {
    while (cursor < todo.length) {
      const c = todo[cursor++];
      const i = cursor;
      try {
        const r = await ratioFor(c);
        if (r.skip === 'not in getleads') {
          stats.blank_notfound++;
          console.log(`${i}/${todo.length} ${c.domain} -> blank (not in GetLeads)`);
          continue;
        }
        if (r.skip === 'no domain') { stats.blank_nodomain++; continue; }

        if (r.infra === 0) stats.noInfra++; else stats.hasInfra++;
        console.log(`${i}/${todo.length} ${c.domain} -> ${r.ratio}  (total ${r.total}, infra ${r.infra}, dev ${r.dev})`);
        pending.push({ id: c.id, fields: { [RATIO_FIELD]: r.ratio } });
        await flush(false);
      } catch (e) {
        stats.failed++;
        console.error(`${i}/${todo.length} ${c.domain} -> FAILED ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, n) => worker(n)));
  await flush(true);

  console.log('\n--- done ---');
  console.log(`written           ${stats.written}`);
  console.log(`  no infra owner  ${stats.noInfra}`);
  console.log(`  has infra owner ${stats.hasInfra}`);
  console.log(`blank, not in GL  ${stats.blank_notfound}`);
  console.log(`blank, no domain  ${stats.blank_nodomain}`);
  console.log(`failed            ${stats.failed}`);
  console.log('\nVerify in the base, not from this log.');
}

main().catch((e) => { console.error(e); process.exit(1); });
