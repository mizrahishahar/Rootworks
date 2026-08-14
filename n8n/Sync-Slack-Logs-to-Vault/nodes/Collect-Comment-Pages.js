const resp=$json||{};
const comments=resp.comments||[];
let rid='';
try{ rid=$('Attach Card').item.json.record_id||''; }
catch(e){ try{ const a=$('Attach Card').all(); if(a.length===1) rid=(a[0].json&&a[0].json.record_id)||''; }catch(e2){} }
return { json: { record_id: rid, seen: comments.map(c=>String((c&&c.text)||'')).join('\n') } };