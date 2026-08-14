const lookup = $('Build Segment Lookup').first().json.lookup;
const domain = String(($json.fields && $json.fields.Domain) || '').trim().toLowerCase();
const seg = lookup[domain] || {};
return { json: { id: $json.id, 'Segment Description': seg.segDesc || '', 'Segment Id': seg.segId || '' } };