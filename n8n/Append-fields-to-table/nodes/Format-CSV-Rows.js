// Format CSV Rows: the Companies path (Operator ruling 2026-09-02). A client's own list lands
// on Companies through the helper (Insert domains to Clayroots): one row per distinct CSV
// domain with the attribute columns Validate & Build Lookup kept, the helper's contract as
// _meta on the first row with Domain Source = CSV and allowNew on, so a CSV column the register
// lacks becomes an open field (a column on Companies plus its lookup on People), a blacklisted
// column is dropped and counted, a register column must already exist. The key is Domain here:
// Final Email and Contact Key are People keys and stay on the update-only path.
const v=$('Resolve Table').first().json;
if(v.keyName!=='Domain'){ throw new Error('On Companies the key is Domain: Append fields lands the list through Insert domains to Clayroots, which upserts on Domain. Key column "'+v.keyName+'" is a People key. Nothing was written.'); }
const lookup=v.lookup||{};
const out=Object.keys(lookup).map(d=>({ json: Object.assign({ Domain: d }, lookup[d]) }));
if(!out.length){ throw new Error('Head guard: the CSV carries no domain to land. Nothing was written.'); }
out[0].json._meta={ base: v.baseId, clientRecId: v.clientRecId||'', tag: v.tag||'', domainSource: 'CSV', allowNew: true };
return out;
