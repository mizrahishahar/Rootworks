// GitHub Filers: the front half of the "filed on a vendor repo" intent signal.
//
//   STEP 1 (feed): for each watched repo, read issues and pull requests created inside
//     the window. Free, public, read-only REST. The endpoint returns PRs alongside
//     issues (a pull_request key marks them), so the event filter is ours. Results come
//     back newest first, so the run stops the moment it reaches the repo's own cursor.
//   STEP 2 (identity): for each unique filer, read the public profile, and when it names
//     no employer, the public org memberships. GitHub-only calls, nothing paid. A domain
//     is emitted ONLY when GitHub handed it over for free (an org or personal site);
//     otherwise the raw employer name goes out and n8n does the paid matching.
//   STEP 3 (exclusion): drop the vendor's own staff. Measured 2026-09-10 on a 50-filer
//     sample of terraform-provider-aws, argo-cd and cert-manager: a THIRD of everyone
//     who resolves works for the repo owner (@hashicorp, @aws). Without this the signal
//     is mostly maintainers.
//   OUTPUT: one normalized dataset row per company, the shape the n8n door parses. The
//     scheduled task's webhook posts { signal, resource } to that door; this actor never
//     calls n8n itself.
//
// LAW: the actor spends nothing. Every paid call (DiscoLike bizdata, the ICP verdict,
// the company-name to domain match) stays in n8n, where the Hub row counts it.
//
// LAW: we never take a contact from GitHub. GitHub's acceptable use forbids using
// information from the service, email addresses explicitly, to send unsolicited mail.
// So no public email is read, no commit author address is mined, and the output is a
// COMPANY plus public evidence. People come from our own providers via Enrich Contacts.
//
// Every decision about what a row MEANS lives in lib.js and is tested against fixtures.
import { Actor, log } from 'apify';
import { readEmployer, norm, buildVendorKeys, buildWho, isVendorStaff, groupCompanies, toDatasetRow } from './lib.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const {
  repos = [],
  lookbackDays = 7,
  events = ['issue', 'pr'],
  excludeOrgs = [],
  maxPagesPerRepo = 5,
  maxCompanies = 500,
  userCacheDays = 30,
  bodyMaxChars = 4000,
  githubToken = process.env.GITHUB_TOKEN || '',
} = input;

if (!repos.length) throw new Error('input.repos is empty: nothing to watch');
if (!githubToken) log.warning('no GitHub token: this run is capped at 60 requests an hour');

const API = 'https://api.github.com';
const HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'flowroots-github-filers',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let calls = 0;
let rateStops = 0;

async function gh(path, { allow404 = false } = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(API + path, { headers: HEADERS });
    calls++;
    if (res.status === 404 && allow404) return null;
    if (res.status === 403 || res.status === 429) {
      // Secondary rate limit or an exhausted primary one. Honour what GitHub tells us.
      const retryAfter = Number(res.headers.get('retry-after') || 0);
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0);
      const waitMs = retryAfter ? retryAfter * 1000
        : reset ? Math.max(0, reset * 1000 - Date.now()) + 1000
          : 60000;
      rateStops++;
      log.warning(`rate limited on ${path}, waiting ${Math.round(waitMs / 1000)}s`);
      if (waitMs > 15 * 60 * 1000) throw new Error(`rate limit resets in ${Math.round(waitMs / 1000)}s, giving up`);
      await sleep(waitMs);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} on ${path}`);
    const body = await res.json();
    const remaining = Number(res.headers.get('x-ratelimit-remaining') ?? '999');
    if (remaining < 50) {
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0);
      const waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
      rateStops++;
      log.warning(`only ${remaining} requests left, waiting ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
    }
    return body;
  }
  throw new Error(`gave up on ${path} after repeated rate limits`);
}

const vendorKeys = buildVendorKeys(repos, excludeOrgs);

const state = (await Actor.getValue('STATE')) ?? { repos: {}, users: {} };
state.repos ??= {};
state.users ??= {};

const cutoff = Date.now() - lookbackDays * 86400 * 1000;
const wantIssues = events.includes('issue');
const wantPrs = events.includes('pr');

// ---------------------------------------------------------------- STEP 1: the feeds
const filings = [];
const perRepo = {};
for (const repo of repos) {
  const lastSeen = state.repos[repo] ? Date.parse(state.repos[repo]) : 0;
  const floor = Math.max(cutoff, lastSeen);
  let kept = 0;
  let newest = state.repos[repo] || null;
  let stop = false;
  for (let page = 1; page <= maxPagesPerRepo && !stop; page++) {
    let items;
    try {
      items = await gh(`/repos/${repo}/issues?state=all&per_page=100&sort=created&direction=desc&page=${page}`);
    } catch (e) {
      log.error(`feed failed for ${repo} page ${page}: ${e.message}`);
      break; // one broken repo never kills the run
    }
    if (!items?.length) break;
    for (const it of items) {
      if (Date.parse(it.created_at) <= floor) { stop = true; break; } // sorted desc: the rest is older
      const isPr = Boolean(it.pull_request);
      if (isPr && !wantPrs) continue;
      if (!isPr && !wantIssues) continue;
      const u = it.user || {};
      if (u.type !== 'User') continue;
      if (String(u.login || '').endsWith('[bot]')) continue;
      if (!newest || Date.parse(it.created_at) > Date.parse(newest)) newest = it.created_at;
      filings.push({
        repo,
        login: u.login,
        isPr,
        title: it.title || '',
        body: String(it.body || '').slice(0, bodyMaxChars),
        labels: (it.labels || []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean).join(', '),
        state: it.state,
        url: it.html_url,
        createdAt: it.created_at,
      });
      kept++;
    }
  }
  if (newest) state.repos[repo] = newest;
  perRepo[repo] = kept;
  log.info(`feed ${repo}: ${kept} filings in window`);
}

const byLogin = new Map();
for (const f of filings) {
  if (!byLogin.has(f.login)) byLogin.set(f.login, []);
  byLogin.get(f.login).push(f);
}
log.info(`${filings.length} filings, ${byLogin.size} unique filers`);

// ---------------------------------------------------------------- STEP 2: identity
const cacheFloor = Date.now() - userCacheDays * 86400 * 1000;
const drop = { noEmployer: 0, vendorStaff: 0, lookupFailed: 0 };
const resolved = [];

for (const [login] of byLogin) {
  const cached = state.users[login];
  let who;
  if (cached && Date.parse(cached.at) > cacheFloor) {
    who = cached;
  } else {
    let profile;
    try {
      profile = await gh(`/users/${login}`, { allow404: true });
    } catch (e) {
      log.warning(`profile failed for ${login}: ${e.message}`);
      drop.lookupFailed++;
      continue;
    }
    if (!profile) { drop.lookupFailed++; continue; }

    const employer = readEmployer(profile.company);
    let handle = employer.handle;
    let via = '';

    if (!handle && !employer.name) {
      // No employer named. Public org memberships are the next free hint.
      let orgs = [];
      try {
        orgs = (await gh(`/users/${login}/orgs`, { allow404: true })) || [];
      } catch { orgs = []; }
      const candidate = orgs.find((o) => !vendorKeys.has(norm(o.login)));
      if (candidate) { handle = String(candidate.login).toLowerCase(); via = 'public org membership'; }
    }

    // An org handle usually carries the company's own website: the domain, for free.
    let org = null;
    if (handle) {
      try {
        org = await gh(`/orgs/${handle}`, { allow404: true });
      } catch { org = null; }
    }

    who = buildWho({ profile: { ...profile, login }, org, orgHandle: handle, via });
    state.users[login] = who;
    await sleep(120);
  }

  if (!who.employerName && !who.domain) { drop.noEmployer++; continue; }
  if (isVendorStaff(who, vendorKeys)) { drop.vendorStaff++; continue; }
  resolved.push(who);
}

// ---------------------------------------------------------------- STEP 3: one row per company
const companies = groupCompanies(resolved, byLogin);

let pushed = 0;
let withDomain = 0;
for (const [, bucket] of companies) {
  if (pushed >= maxCompanies) { log.warning(`hit maxCompanies ${maxCompanies}, stopping`); break; }
  const row = toDatasetRow(bucket);
  if (!row) continue;
  await Actor.pushData(row);
  pushed++;
  if (row.domain) withDomain++;
}

await Actor.setValue('STATE', state);

const summary = {
  repos: repos.length,
  filings: filings.length,
  uniqueFilers: byLogin.size,
  resolved: resolved.length,
  companies: pushed,
  withDomain,
  droppedNoEmployer: drop.noEmployer,
  droppedVendorStaff: drop.vendorStaff,
  droppedLookupFailed: drop.lookupFailed,
  githubCalls: calls,
  rateStops,
  perRepo,
};
log.info(`DONE ${JSON.stringify(summary)}`);
await Actor.setValue('SUMMARY', summary);
await Actor.exit();
