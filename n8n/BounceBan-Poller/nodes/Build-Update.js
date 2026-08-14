const r=$json; const res=r.result;
// 2026-08-12: 'Email Source' replaces 'Source' (Operator ruling). And only a DEFINITIVE verdict may
// touch the address columns: deliverable fills them, undeliverable clears them. risky / unknown /
// error write only BB and Status - omitting the keys leaves the existing Final Email untouched.
if(res==='deliverable'){ return { json:{ id:r.rowId, 'BB':res, 'Final Email':r.email, 'Email Source':r.slot, 'Status':'done' } }; }
if(res==='undeliverable'){ return { json:{ id:r.rowId, 'BB':res, 'Final Email':'', 'Email Source':'none', 'Status':'no_email_found' } }; }
if(res==='risky'||res==='unknown'){ return { json:{ id:r.rowId, 'BB':res, 'Status':'no_email_found' } }; }
return { json:{ id:r.rowId, 'BB':'error', 'Status':'error' } };