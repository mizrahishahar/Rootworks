// 2026-08-12 Operator ruling, applied at the write boundary: company_clean is retired (the cleaned
// name is already written into Company by Process Batch), and 'Contact Source' replaces 'Source'
// for record provenance. 'Email Source' (tier) is owned by the verification lane.
const rows = $('Process Batch').first().json.rows || [];
return rows.map(r => { const j = { ...r }; delete j.company_clean; if(Object.prototype.hasOwnProperty.call(j,'Source')){ if(j['Contact Source']===undefined) j['Contact Source']=j.Source; delete j.Source; } return { json: j }; });