const raw = $input.first().json;
const input = (raw && raw.output) ? raw.output : raw;
const companyRaw = $('Get Company Record').item.json;
const company = (companyRaw && companyRaw.fields) ? companyRaw.fields : companyRaw;
const brand = company.Name || 'Brand';
const realDomain = (company.domain || '').toLowerCase();

const comGroups = {
  prefix: Array.isArray(input.prefix) ? input.prefix : [],
  suffix: Array.isArray(input.suffix) ? input.suffix : [],
  abbreviated: Array.isArray(input.abbreviated) ? input.abbreviated : []
};
const infoRaw = Array.isArray(input.info) ? input.info : [];

const seen = new Set();
const uniqueCom = [];
for (const g of ['prefix', 'suffix', 'abbreviated']) {
  for (let d of comGroups[g]) {
    if (typeof d !== 'string') continue;
    d = d.toLowerCase().trim().replace(/\s+/g, '');
    if (!d.endsWith('.com')) continue;
    if (d === realDomain) continue;
    if (seen.has(d)) continue;
    seen.add(d);
    uniqueCom.push({ domain: d, group: g });
  }
}

const infoSeen = new Set();
const uniqueInfo = [];
for (let d of infoRaw) {
  if (typeof d !== 'string') continue;
  d = d.toLowerCase().trim().replace(/\s+/g, '');
  if (!d.endsWith('.info')) continue;
  if (d === realDomain) continue;
  if (infoSeen.has(d)) continue;
  infoSeen.add(d);
  uniqueInfo.push(d);
}
const finalInfo = uniqueInfo.slice(0, 50);

const helpers = this.helpers;
async function rdapOne(item) {
  try {
    const res = await helpers.httpRequest({
      method: 'GET',
      url: 'https://rdap.verisign.com/com/v1/domain/' + item.domain,
      returnFullResponse: true,
      ignoreHttpStatusErrors: true,
      json: false,
      timeout: 8000
    });
    const status = res && (res.statusCode || res.status);
    return Object.assign({}, item, { available: status === 404, status: status });
  } catch (e) {
    return Object.assign({}, item, { available: false, status: 'ERR', error: String(e && e.message ? e.message : e).slice(0, 120) });
  }
}

async function rdapCheck(items) {
  const out = [];
  for (let i = 0; i < items.length; i += 10) {
    const slice = items.slice(i, i + 10);
    const results = await Promise.all(slice.map(rdapOne));
    out.push(...results);
    if (i + 10 < items.length) {
      await new Promise(function (r) { setTimeout(r, 200); });
    }
  }
  return out;
}

const checked = await rdapCheck(uniqueCom);
const available = checked.filter(x => x.available);

const statusCounts = {};
for (const c of checked) { const k = String(c.status); statusCounts[k] = (statusCounts[k] || 0) + 1; }
const sampleErrors = checked.filter(x => x.error).slice(0, 3).map(x => x.error);

const target = { prefix: 14, suffix: 14, abbreviated: 12 };
const picked = [];
const usedSet = new Set();
for (const g of ['prefix', 'suffix', 'abbreviated']) {
  for (const a of available) {
    if (picked.filter(p => p.group === g).length >= target[g]) break;
    if (a.group !== g) continue;
    if (usedSet.has(a.domain)) continue;
    picked.push(a);
    usedSet.add(a.domain);
  }
}
for (const a of available) {
  if (picked.length >= 40) break;
  if (usedSet.has(a.domain)) continue;
  picked.push(a);
  usedSet.add(a.domain);
}

const finalDomains = picked.slice(0, 40).map(p => p.domain);

const firstPool = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Nancy','Daniel','Lisa','Matthew','Margaret','Anthony','Betty','Mark','Sandra'];
const lastPool = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker'];
function shuffle(arr) { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = x[i]; x[i] = x[j]; x[j] = tmp; } return x; }
const firsts = shuffle(firstPool).slice(0, 5);
const lasts = shuffle(lastPool).slice(0, 5);
const names = firsts.map((f, i) => ({ f: f.toLowerCase(), l: lasts[i].toLowerCase() }));

function nineFormats(f, l) { return [ f, l, f + '.' + l, f[0] + '.' + l, f + '.' + l[0], f + l, f[0] + '_' + l, f + l[0], f[0] + l ]; }
function extraFmt(f, l, k) { const e = [ f + '_' + l, l + '.' + f, l + f[0], l + '-' + f ]; return e[k]; }

const firstDomain = finalDomains[0] || 'example.com';
const inboxes = [];
names.forEach((n, i) => {
  for (const local of nineFormats(n.f, n.l)) inboxes.push(local + '@' + firstDomain);
  if (i < 4) inboxes.push(extraFmt(n.f, n.l, i) + '@' + firstDomain);
});

let md = '# Infrastructure\n\n';
md += '_Brand: ' + brand + ' \u00b7 .com checked: ' + uniqueCom.length + ' \u00b7 .com available: ' + available.length + ' \u00b7 .info generated: ' + finalInfo.length + '_\n\n';
if (finalDomains.length < 40) {
  md += '> WARNING: Only ' + finalDomains.length + ' available .com domains found (target 40). Status counts: ' + JSON.stringify(statusCounts) + (sampleErrors.length ? ' Errors: ' + JSON.stringify(sampleErrors) : '') + '\n\n';
}
if (finalInfo.length < 50) {
  md += '> WARNING: Only ' + finalInfo.length + ' .info domains generated (target 50).\n\n';
}
md += '## 1. DOMAINS (.com)\n\n';
finalDomains.forEach((d, i) => { md += (i + 1) + '. ' + d + '\n'; });
md += '\n---\n\n## 2. DOMAINS (.info)\n\n';
md += '_Not RDAP-checked. Branded .info candidates._\n\n';
finalInfo.forEach((d, i) => { md += (i + 1) + '. ' + d + '\n'; });
md += '\n---\n\n## 3. INBOXES\n\n';
md += '| # | Email |\n|---|-------|\n';
inboxes.forEach((e, i) => { md += '| ' + (i + 1) + ' | ' + e + ' |\n'; });
md += '\nThese 5 sender identities and their 49 inbox configurations are replicated identically across all 40 .com domains and 50 .info domains.\n';

return [{ json: { brand: brand, domainCount: finalDomains.length, infoCount: finalInfo.length, totalChecked: uniqueCom.length, availableCount: available.length, statusCounts: statusCounts, sampleErrors: sampleErrors, markdown: md } }];