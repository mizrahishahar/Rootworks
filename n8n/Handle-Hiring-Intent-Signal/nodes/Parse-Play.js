// Parse Play: the Signals row (Hub, one row per signal) into the run's config. Typed fields,
// no grammar: Name, Client (link), Signal Type, Target Table, Roles, Country, Max Employees, ICP.
// The upstream node searches Signals with OR(RECORD_ID() = launch play id, {Signal Type} = 'hiring'),
// so a legacy launch id (the retired KB play row) still resolves as long as exactly ONE hiring
// signal exists; ambiguity or no match stops the run before any paid call.
// Who gets MESSAGED is not config here or anywhere in this machine: relevance and the views
// on the target table decide that. This machine only lands rows.
const launch=$('Parse Launch').first().json;
const rows=$input.all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
const norm=(r)=>({ id:r.id, f:(r.fields||r) });
const wanted=launch.play;
const all=rows.map(norm);
const missing=[];
let hit=all.find(r=>r.id===wanted);
let legacy=false;
if(!hit){
  const hiring=all.filter(r=>String(r.f['Signal Type']||'')==='hiring');
  if(hiring.length===1){ hit=hiring[0]; legacy=true; }
  else missing.push(hiring.length===0?'no Signals row found for launch id '+wanted:'launch id '+wanted+' unknown and '+hiring.length+' hiring signals exist (ambiguous); update the Apify webhook payload to the Signals record id');
}
const f=hit?hit.f:{};
const list=(s)=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const clientLink=Array.isArray(f['Client'])?f['Client'][0]:'';
const client=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
const table=String(f['Target Table']||'').trim();
const roles=list(f['Roles']);
const country=String(f['Country']||'').trim();
const maxEmployees=Number(f['Max Employees'])||0;
const icp=String(f['ICP']||'').trim();
if(hit){
  if(!client) missing.push('Client link on the Signals row');
  if(!/^tbl[A-Za-z0-9]{14}$/.test(table)) missing.push('Target Table (not a tbl id)');
  if(!roles.length) missing.push('Roles');
  if(!country) missing.push('Country');
  if(!maxEmployees) missing.push('Max Employees');
  if(!icp) missing.push('ICP');
}
return [{ json: {
  play: launch.play, datasetId: launch.datasetId, kvStoreId: launch.kvStoreId, sender: launch.sender,
  play_name: f['Name']||'', signal_row: hit?hit.id:'', legacy_launch_id: legacy,
  client, table, event_type: String(f['Signal Type']||'hiring'),
  country, max_headcount: maxEmployees, icp_text: icp,
  roles,
  config_ok: missing.length===0, missing, guard:'play'
}}];
