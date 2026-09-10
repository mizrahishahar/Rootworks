// Parse Play: the Signals row (Hub, one row per signal) into the run's config. Typed fields,
// no grammar: Name, Client (link), Signal Type, Country, Max Employees, ICP. Target Table is
// retired (List Building 2.0, 2026-09-02): every signal writes the client's Companies table,
// resolved downstream from the Client link. A signal is the Signals link on the row, never a
// Tag: nothing here reads a Tag. Roles is read but not required: the reviews handler writes
// no Existing In Role (not on its register).
// The upstream node searches Signals with OR(RECORD_ID() = launch play id, {Signal Type} =
// 'trustpilot_reviews'), so a launch whose id went stale still resolves as long as exactly ONE
// trustpilot_reviews signal exists; ambiguity or no match stops the run before any paid call.
// The type names the DATASET SHAPE this handler's source-parse reads, never the topic: stars,
// topics, freshness are Apify task config (Operator ruling 2026-09-01).
// Country may be a comma list ("US, GB"): the company's country, never the reviewer's.
// Who gets MESSAGED is not config here or anywhere in this machine: relevance and the views
// on People decide that. This machine only lands company rows.
// Diff from the hiring handler: the fallback Signal Type string, the default event_type, Roles optional.
const launch=$('Parse Launch').first().json;
const rows=$input.all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
const norm=(r)=>({ id:r.id, f:(r.fields||r) });
const wanted=launch.play;
const all=rows.map(norm);
const missing=[];
let hit=all.find(r=>r.id===wanted);
let legacy=false;
if(!hit){
  const same=all.filter(r=>String(r.f['Signal Type']||'')==='trustpilot_reviews');
  if(same.length===1){ hit=same[0]; legacy=true; }
  else missing.push(same.length===0?'no Signals row found for launch id '+wanted:'launch id '+wanted+' unknown and '+same.length+' trustpilot_reviews signals exist (ambiguous); update the Apify webhook payload to the Signals record id');
}
const f=hit?hit.f:{};
const list=(s)=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const clientLink=Array.isArray(f['Client'])?f['Client'][0]:'';
const client=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
const roles=list(f['Roles']);
const countries=list(f['Country']).map(c=>c.toUpperCase());
const country=countries.join(', ');
const maxEmployees=Number(f['Max Employees'])||0;
const icp=String(f['ICP']||'').trim();
if(hit){
  if(!client) missing.push('Client link on the Signals row');
  if(!country) missing.push('Country');
  if(!maxEmployees) missing.push('Max Employees');
  if(!icp) missing.push('ICP');
}
return [{ json: {
  play: launch.play, datasetId: launch.datasetId, kvStoreId: launch.kvStoreId, sender: launch.sender,
  play_name: f['Name']||'', signal_row: hit?hit.id:'', legacy_launch_id: legacy,
  client, event_type: String(f['Signal Type']||'trustpilot_reviews'),
  country, countries, max_headcount: maxEmployees, icp_text: icp,
  roles,
  config_ok: missing.length===0, missing, guard:'play'
}}];
