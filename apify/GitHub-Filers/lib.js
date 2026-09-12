// The pure half of GitHub Filers: no network, no Apify, so it can be tested against
// fixtures. main.js owns the fetching and the state; everything that decides what a
// row MEANS lives here.

// Hosts that tell us nothing about an employer.
export const PERSONAL_MAIL = new Set(['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
  'icloud.com', 'proton.me', 'protonmail.com', 'me.com', 'live.com', 'qq.com', '163.com',
  'gmx.de', 'web.de', 'mail.ru', 'yandex.ru', 'users.noreply.github.com']);

export const NOT_A_COMPANY_SITE = ['github.io', 'github.com', 'gitlab.com', 'medium.com', 'dev.to',
  'linkedin.com', 'twitter.com', 'x.com', 'bsky.app', 'notion.site', 'substack.com',
  'hashnode.dev', 'vercel.app', 'netlify.app', 'herokuapp.com', 'wordpress.com', 'blogspot.com',
  'about.me', 'linktr.ee', 'youtube.com', 'stackoverflow.com', 'keybase.io'];

export const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function hostOf(url) {
  if (!url) return null;
  const raw = String(url).trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let host;
  try {
    host = new URL(withScheme).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, '');
  if (!host.includes('.')) return null;
  if (NOT_A_COMPANY_SITE.some((bad) => host === bad || host.endsWith(`.${bad}`))) return null;
  if (PERSONAL_MAIL.has(host)) return null;
  return host;
}

// "@hashicorp / @IBM" -> handle hashicorp, name "hashicorp". "SoFi" -> name "SoFi", no handle.
export function readEmployer(companyField) {
  const raw = String(companyField || '').trim();
  if (!raw) return { raw: '', name: '', handle: '' };
  const first = raw.split(/\s*[/|,]\s*/)[0].trim();
  const handleMatch = first.match(/^@([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)/);
  return {
    raw,
    name: first.replace(/^@/, '').trim(),
    handle: handleMatch ? handleMatch[1].toLowerCase() : '',
  };
}

// Every watched repo's owner is a vendor, plus whatever the task names.
export function buildVendorKeys(repos = [], excludeOrgs = []) {
  const keys = new Set();
  for (const repo of repos) keys.add(norm(String(repo).split('/')[0]));
  for (const org of excludeOrgs) keys.add(norm(org));
  keys.delete('');
  return keys;
}

// A third of everyone who resolves works for the repo owner (measured 2026-09-10).
// Matching the whole normalized string is not enough: "@aws" normalizes to "aws" but
// "Amazon Web Services (AWS)" normalizes to "amazonwebservicesaws" and slips through.
// So the employer name is also tested token by token.
export function isVendorStaff(who, vendorKeys) {
  const whole = [norm(who.employerHandle), norm(who.employerName), norm((who.domain || '').split('.')[0])];
  if (whole.some((k) => k && vendorKeys.has(k))) return true;
  const tokens = String(who.employerName || '').split(/[^A-Za-z0-9]+/).map(norm).filter(Boolean);
  return tokens.some((t) => vendorKeys.has(t));
}

// Turn a public profile (and the org behind it, when there was one) into what we keep.
// Pure: main.js does the fetching, this decides what any of it means.
//
// The personal site is a domain hint for an employer we already named, never an employer
// on its own. Proven 2026-09-10: taking a profile site with no company field produced
// samueljames.dev, ispindel.de and dipakchaudhari.me, three personal pages out of
// eighteen rows. A blog is not a buyer.
export function buildWho({ profile, org = null, orgHandle = '', via = '' }) {
  const employer = readEmployer(profile.company);
  let name = employer.name;
  let handle = employer.handle || orgHandle || '';
  let domain = null;
  let how = employer.handle ? 'profile company handle'
    : employer.name ? 'profile company text'
      : via || '';

  if (org) {
    const site = hostOf(org.blog);
    if (org.name) name = org.name;
    if (site) { domain = site; how = how ? `${how} + org site` : 'org site'; }
  }
  if (!domain && name) {
    const personal = hostOf(profile.blog);
    if (personal) { domain = personal; how = how ? `${how} + profile site` : 'profile site'; }
  }

  return {
    login: profile.login,
    name: profile.name || null,
    location: profile.location || null,
    employerRaw: employer.raw,
    employerName: name || '',
    employerHandle: handle || '',
    domain: domain || null,
    how: how || '',
    at: new Date().toISOString(),
  };
}

// One row per company: the newest filing is the headline, the rest ride along as context.
export function groupCompanies(resolved, filingsByLogin) {
  const companies = new Map();
  for (const who of resolved) {
    const key = who.domain || norm(who.employerName);
    if (!key) continue;
    if (!companies.has(key)) companies.set(key, { who: [], filings: [] });
    const bucket = companies.get(key);
    bucket.who.push(who);
    bucket.filings.push(...(filingsByLogin.get(who.login) || []));
  }
  return companies;
}

export function toDatasetRow(bucket) {
  const sorted = bucket.filings.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const head = sorted[0];
  if (!head) return null;
  const lead = bucket.who.find((w) => w.login === head.login) || bucket.who[0];
  return {
    source: 'github_filed',
    domain: lead.domain || null,        // null means n8n must match the name to a domain
    company_name: lead.employerName || null,
    detected_at: head.createdAt,
    evidence_url: head.url,
    payload: {
      repo: head.repo,
      issue_title: head.title,
      issue_body: head.body,
      issue_labels: head.labels,
      issue_state: head.state,
      is_pr: head.isPr,
      filed_at: head.createdAt,
      filer_login: lead.login,
      filer_name: lead.name,
      filer_location: lead.location,
      employer_raw: lead.employerRaw,
      employer_org: lead.employerHandle,
      resolve_method: lead.how,
      filings_in_window: sorted.length,
      other_filers: bucket.who.filter((w) => w.login !== lead.login).map((w) => w.login),
      other_issues: sorted.slice(1, 6).map((f) => ({ repo: f.repo, title: f.title, url: f.url, at: f.createdAt })),
    },
  };
}
