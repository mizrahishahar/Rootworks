// Retain the LIST of domains that came back from Supersoniq with no contact.
// Build Log only ever renders the count; the set itself was discarded.
const log = $input.first().json;

const norm = (v) => String(v || '').trim().toLowerCase();

// Side A: the domains actually submitted to Supersoniq.
let submitted = [];
try {
  const req = $('Build SQ Requests').first().json;
  submitted = (req.companies || []).map((c) => norm(c.domain)).filter(Boolean);
} catch (e) {
  submitted = [];
}

// Side B: the domains present in the Supersoniq results.
const withContacts = new Set();
try {
  for (const it of $('Format Supersoniq').all()) {
    const d = norm(it.json.Domain);
    if (d) withContacts.add(d);
  }
} catch (e) {}

// Useful columns for a contactless domain come from the ContaGen side of the same row.
const contagen = new Map();
try {
  for (const it of $('Format ContaGen').all()) {
    const d = norm(it.json.Domain);
    if (!d) continue;
    const prev = contagen.get(d);
    if (prev) { prev.count += 1; continue; }
    contagen.set(d, {
      count: 1,
      Company: it.json.company_clean || it.json.Company || '',
      Employees: it.json.Employees || '',
      IndustryGroups: it.json['Industry Groups'] || '',
      City: it.json.City || '',
      State: it.json.State || '',
      Country: it.json.Country || '',
    });
  }
} catch (e) {}

const seen = new Set();
const rows = [];
for (const d of submitted) {
  if (withContacts.has(d) || seen.has(d)) continue;
  seen.add(d);
  const c = contagen.get(d) || {};
  rows.push({
    Domain: d,
    Company: c.Company || '',
    Employees: c.Employees || '',
    'Industry Groups': c.IndustryGroups || '',
    City: c.City || '',
    State: c.State || '',
    Country: c.Country || '',
    'ContaGen Contacts': c.count || 0,
    'Build Date': String(log['Run at'] || '').slice(0, 10),
    'Run ID': String(log['Execution ID'] || ''),
  });
}

// driveMainFolderID rides on the client record. Resolve Client runs on every path;
// Resolve Base only on the webhook path.
let driveMainFolderID = '';
try { driveMainFolderID = $('Resolve Client').first().json.fields.driveMainFolderID || ''; } catch (e) {}
if (!driveMainFolderID) {
  try { driveMainFolderID = $('Resolve Base').first().json.fields.driveMainFolderID || ''; } catch (e) {}
}

let buildName = String(log.Target || '').replace(/\s*\([a-zA-Z0-9]+\)\s*$/, '').trim();
buildName = buildName.replace(/\s*-\s*Contacts$/i, '').trim();
if (!buildName) {
  try { buildName = String($('Launch Params').first().json['Build name'] || '').trim(); } catch (e) {}
}
if (!buildName) buildName = 'Build';

const day = String(log['Run at'] || '').slice(0, 10) || new Date().toISOString().slice(0, 10);

return [{
  json: {
    ...log,
    _overflow: {
      count: rows.length,
      submitted: submitted.length,
      withContacts: withContacts.size,
      rows,
      driveMainFolderID,
      buildName,
      fileName: day + ' - ' + buildName + ' - Domains without contacts.csv',
    },
  },
}];
