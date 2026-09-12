const t=$input.first().json||{};
const prev=$('Alta Get Token').first().json||{};
const sd=$getWorkflowStaticData('global');
sd.altaThreads={checked:0,updated:0,skipped:[]};
const access=t.access_token||'';
if(!access) return [{ json: { _authFailed:true, detail: JSON.stringify(t).slice(0,300) } }];
return [{ json: { access_token:access, refresh_token:t.refresh_token||prev.refresh_token||'', expires_at:new Date(Date.now()+((t.expires_in||86400)*1000)).toISOString() } }];