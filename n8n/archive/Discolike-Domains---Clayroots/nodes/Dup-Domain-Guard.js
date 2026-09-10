const r = $('Table Router').first().json;
let rows = [];
try { rows = $('AT Read Domains').all().map(i => i.json || {}); } catch (e) { rows = []; }
const counts = new Map();
for (const it of rows) {
  const raw = (it.Domain !== undefined) ? it.Domain : ((it.fields || {}).Domain);
  const d = String(raw == null ? '' : raw).trim().toLowerCase();
  if (!d) continue;
  counts.set(d, (counts.get(d) || 0) + 1);
}
const dups = Array.from(counts.entries()).filter(e => e[1] > 1).map(e => e[0]);
if (dups.length) { throw new Error("Target table '" + r.tableName + "' has repeated Domain values (e.g. " + dups.slice(0,3).join(', ') + '), which means it is contact-shaped. Refusing to upsert on Domain. Nothing was written.'); }
return [{ json: Object.assign({}, r, { fieldsCreated: [], domainsChecked: counts.size }) }];