// Parse Play: the Signals row (Hub, one row per signal) into the run's config. Typed fields,
// no grammar: Name, Client (link), Signal Type, Country, ICP. Target Table is retired (List
// Building 2.0, 2026-09-02): every signal writes the client's Companies table, resolved
// downstream from the Client link. A signal is the Signals link on the row, never a Tag:
// nothing here reads a Tag.
//
// What this Rootflow needs off the row, and nothing more (dead fields dropped 2026-09-10):
//   Client        resolves the Clayroots base. Required.
//   Country       the COMPANY's country, a comma list ("US, GB"), the one hard line Trustpilot
//                 can answer. Required.
//   ICP           the "we sell to" sentence the DiscoLike ICP check judges against. Required.
//   Signal Type   names the DATASET SHAPE this handler's source-parse reads, never the topic:
//                 stars, topics and freshness are Apify task config (Operator 2026-09-01).
//   Roles         not read: reviews write no Existing In Role, it is not on their register.
//   Max Employees not read: Trustpilot carries no headcount and this handler gates on none;
//                 BizData lands Employees on the row and the ICP sentence carries the size
//                 qualification. It was required here until 2026-09-10 and never used, so a
//                 blank Max Employees no longer refuses a run it cannot affect.
//
// The upstream node searches Signals with OR(RECORD_ID() = launch play id, {Signal Type} =
// 'trustpilot_reviews'), so a launch whose id went stale still resolves as long as exactly ONE
// trustpilot_reviews signal exists; ambiguity or no match refuses the run before any paid call.
// Who gets MESSAGED is not config here or anywhere in this machine: relevance and the views
// on People decide that. This machine only lands company rows.
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
const countries=list(f['Country']).map(c=>c.toUpperCase());
const country=countries.join(', ');
const icp=String(f['ICP']||'').trim();
if(hit){
  if(!client) missing.push('Client link on the Signals row');
  if(!country) missing.push('Country');
  if(!icp) missing.push('ICP');
}
return [{ json: {
  play: launch.play, datasetId: launch.datasetId,
  play_name: f['Name']||'', signal_row: hit?hit.id:'', legacy_launch_id: legacy,
  client, event_type: String(f['Signal Type']||'trustpilot_reviews'),
  country, countries, icp_text: icp,
  config_ok: missing.length===0, missing, guard:'play'
}}];
