// Run Context: one shape for every run, launched or scheduled.
// sd.launch.recordId     the Hub Automations row this run was launched from ('' on a schedule)
// sd.launch.trigger      'form' when launched from the Hub, 'schedule' otherwise
// sd.launch.clientFilter the launch row's Client link (one record id) to scope the run to one client; '' = all clients
// sd.launch.full         true on Mondays (Asia/Jerusalem) and on every launched run: every flag is read and every
//                        client gets the full report. False on the other days: only the daily flags, and only
//                        emergencies are posted (standards/infrastructure.md, The daily and weekly read)
// sd.launch.live         LIVE_CORRECTIONS below. False = the corrections are planned and reported as "would
//                        change", never applied. Flipped to true by a push once the Operator approved a dry report.
const LIVE_CORRECTIONS = false;

const sd = $getWorkflowStaticData('global');
let launch = null;
try { const r = $('Fetch Launch Record').first().json; if (r && r.id) launch = r; } catch (e) {}
const f = (launch && launch.fields) || launch || {};
const cl = Array.isArray(f.Client) && f.Client.length ? f.Client[0] : '';
const clientFilter = (cl && typeof cl === 'object') ? String(cl.id || '') : String(cl || '');
const full = !!launch || $now.setZone('Asia/Jerusalem').weekday === 1;
sd.launch = { recordId: launch ? String(launch.id) : '', trigger: launch ? 'form' : 'schedule', clientFilter, startedAt: $now.toMillis(), full, live: LIVE_CORRECTIONS };
sd.results = [];
delete sd.cw;
return [{ json: Object.assign({}, sd.launch) }];
