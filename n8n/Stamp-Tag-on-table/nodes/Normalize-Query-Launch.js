// Query door: ?baseId&table&tag[&buildDate][&recordId]. A legacy tableId is still read for one
// release; table (People or Companies) wins when both arrive.
const j = $input.first().json || {};
const q = j.query || {};
const s = (v) => (v === undefined || v === null ? '' : String(v).trim());
return [{ json: { baseId: s(q.baseId), table: s(q.table), tableId: s(q.tableId), tag: s(q.tag), buildDate: s(q.buildDate), launchRecordId: s(q.recordId), triggerKind: 'webhook' } }];