// Init Run: one run shape from either door. Run Context set sd.launch (recordId '' on a schedule).
// A scheduled run serves every client; a launched run with a Client on its row serves that client only.
const sd=$getWorkflowStaticData('global');
const launch=sd.launch||{};
const clientFilter=String(launch.clientFilter||'').trim();
sd.run={ start:$now.toISO(), startMs:$now.toMillis(), trigger:launch.recordId?'form':'schedule', clientFilter, watermark:null, watermarkMs:0, watermarkMode:'' };
sd.clients={};
sd.currentClient='';
sd.pull=null;
sd.block=null;
return [{ json:{ trigger:sd.run.trigger, clientFilter } }];
