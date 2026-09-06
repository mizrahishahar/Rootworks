const j = $input.first().json || {};
const q = j.query || {};
const s = (v) => (v === undefined || v === null ? '' : String(v).trim());
return [{ json: { baseId: s(q.baseId), tableId: s(q.tableId), tag: s(q.tag), buildDate: s(q.buildDate), launchRecordId: s(q.recordId), triggerKind: 'webhook' } }];