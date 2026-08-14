const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.pvSyncResults=[];
sd.threadStats={checked:0,updated:0,problems:[]};
sd.clientMap={};
for(const it of $input.all()){ const r=it.json||{}; const f=r.fields||r; if(r.id) sd.clientMap[r.id]={name:f['Client']||'', pvWorkspace:String(f['PlusVibe Workspace ID']||'').trim()}; }
return $input.all();