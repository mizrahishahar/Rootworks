const rec = $('Fetch Launch Record').first().json || {};
const client = $('Resolve Base').first().json || {};
const baseId = String(client['Clayroots Base ID'] == null ? '' : client['Clayroots Base ID']).trim();
const pick = function (v) { return String(v == null ? '' : v).trim(); };
let raw = pick(rec['Table ID']) || pick(rec['fldBeD26SQUi6vRPe']) || pick(rec['Target']);
const m = raw.match(/tbl[A-Za-z0-9]{14}/);
const tableId = m ? m[0] : raw;
return [{ json: { 'Clayroots Base ID': baseId, 'Table ID': tableId, _launchRecordId: rec.id || '', submittedAt: $now.toISO() } }];