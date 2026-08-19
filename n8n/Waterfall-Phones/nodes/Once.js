// Collapses the field-create fan-out back to exactly one update item,
// keyed to the row shape: Hub Contacts writes phone (lowercase), ClayRoots writes Phone.
const f = $('Finalize').first().json;
const row = { id: f.recordId, 'Phone Source': f.result.phone_source };
row[f.hub ? 'phone' : 'Phone'] = f.result.phone;
return [{ json: row }];
