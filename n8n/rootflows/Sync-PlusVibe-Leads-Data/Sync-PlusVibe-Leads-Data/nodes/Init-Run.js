const sd=$getWorkflowStaticData('global');
let trig='schedule', cf='', fp=false;
// Door 1: Execute Workflow call (Manual Start) with clientFilter / fullPass in its payload.
try{
  const t=$('Manual Start').first().json||{};
  trig='event';
  const b=(t&&typeof t.body==='object'&&t.body)?t.body:{};
  const q=(t&&typeof t.query==='object'&&t.query)?t.query:{};
  cf=String(t.clientFilter||b.clientFilter||q.clientFilter||'').trim();
  const rawFp=(t.fullPass!==undefined?t.fullPass:(b.fullPass!==undefined?b.fullPass:q.fullPass));
  fp=(rawFp===true||String(rawFp).toLowerCase()==='true');
}catch(e){}
// Door 2: Hub launch row (Run Context). Its Client link becomes the filter; trigger = form.
const launch=sd.launch||{};
if(launch.recordId){ trig='form'; cf=String(launch.clientFilter||cf||'').trim(); }
sd.run={start:$now.toISO(), trigger:trig, clientFilter:cf, fullPass:fp};
sd.clients={};
sd.pull=null;
sd.write=null;
return [{json:{trigger:trig, clientFilter:cf, fullPass:fp}}];
