// One item per record of the page, shaped for the Clean Fields helper: Company carries the source
// the helper cleans, the raw values ride along for Plan Writes to diff against.
const cfg = $('Detect Company Columns').first().json;
const readVal = (v) => { if (v === null || v === undefined) return ''; if (typeof v === 'object') { return typeof v.value === 'string' ? v.value : ''; } return String(v); };
const resp = $input.first().json || {};
const records = Array.isArray(resp.records) ? resp.records : [];
const out = [];
for (const rec of records) {
  const f = (rec && rec.fields) || {};
  const companyRaw = readVal(f[cfg.companyField]);
  const cleanRaw = cfg.cleanField ? readVal(f[cfg.cleanField]) : '';
  const source = companyRaw.trim() ? companyRaw : cleanRaw;
  out.push({ json: { _recId: rec.id, _companyRaw: companyRaw, _cleanRaw: cleanRaw, _source: source, Company: source } });
}
// An empty page still has to reach Plan Writes (offset handling); the placeholder carries no record.
if (!out.length) return [{ json: { _empty: true } }];
return out;
