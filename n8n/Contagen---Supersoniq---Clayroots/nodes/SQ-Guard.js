const items=$input.all();
for(const i of items){const r=i.json||{};
  if(r.success===false){ throw new Error('Supersoniq enrich failed: '+(r.error||r.detail||r.message||'request error')); }
  if(r.credits_remaining!==undefined && Number(r.credits_remaining)<=0){ throw new Error('Supersoniq credits exhausted mid-run (credits_remaining<=0) - table left partial, failing loud.'); }
}
return items;