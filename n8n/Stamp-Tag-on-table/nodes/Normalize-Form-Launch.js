const f = $input.first().json;
const pick = (o, k) => (o[k] === undefined || o[k] === null ? '' : String(o[k]).trim());
return [{ json: { baseId: pick(f, 'Clayroots Base ID'), tableId: pick(f, 'Table ID'), tag: pick(f, 'Tag'), buildDate: pick(f, 'Build Date'), launchRecordId: '', triggerKind: 'form' } }];