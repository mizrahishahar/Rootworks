// The single update item for the Hub Contacts row.
const f = $('Finalize').first().json;
return [{ json: { id: f.recordId, phone: f.result.phone, 'Phone Source': f.result.phone_source } }];
