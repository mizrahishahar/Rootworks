// Early mirror resolution for the stamp-gate (Operator ruling 2026-08-28): on every PlusVibe
// deploy, a row whose Campaigns links already carry this campaign's mirror row is skipped
// before anything is sent, on top of the sequencer's own dedupe. The daily feeds rely on it.
// No mirror row yet (first deploy into the campaign) resolves to '' and gates nothing.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let rid='';
try{ const r=$input.first().json||{}; if(r.id) rid=r.id; }catch(e){}
D.stampMirrorRid=rid||'';
return [{json: $('Plan Variables').first().json}];
