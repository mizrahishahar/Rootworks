// Run Context: one shape for every run, launched or scheduled.
// sd.launch.recordId  = the Hub Automations row this run was launched from ('' on a schedule)
// sd.launch.trigger   = 'form' when launched from the Hub, 'schedule' otherwise
// sd.launch.clientFilter = the launch row's Client link (one record id) to scope the run to one client; '' = all clients
const sd=$getWorkflowStaticData('global');
let launch=null;
try{ const r=$('Fetch Launch Record').first().json; if(r&&r.id) launch=r; }catch(e){}
const f=(launch&&launch.fields)||launch||{};
const cl=Array.isArray(f.Client)&&f.Client.length?f.Client[0]:'';
const clientFilter=(cl&&typeof cl==='object')?String(cl.id||''):String(cl||'');
sd.launch={ recordId: launch?String(launch.id):'', trigger: launch?'form':'schedule', clientFilter, startedAt:$now.toMillis() };
return [{ json: Object.assign({}, sd.launch) }];
