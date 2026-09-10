// Parse Play: the Hub Signals row named by the payload, read into the run's config. Typed fields,
// no grammar: Name, Client (link), Signal Type, Roles, Country, Max Employees, ICP. Every signal
// writes the client's Companies table, resolved downstream from the Client link (List Building
// 2.0); Target Table is retired. A signal is the Signals link on the row, never a Tag.
//
// The row is fetched by RECORD_ID() alone (ruled 2026-09-10). The old "or the one row whose Signal
// Type is hiring" fallback is gone: it existed to keep a retired KB play id working, and with more
// than one client on the play it can only be ambiguous. An id that resolves to no row is refused
// here, before any paid call, with the fix named.
//
// Who gets MESSAGED is not config here or anywhere in this machine: relevance and the views on
// People decide that. This machine only lands company rows.
const launch=$('Parse Launch').first().json;
const rows=$input.all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
const wanted=launch.play;
const all=rows.map(r=>({ id:r.id, f:(r.fields||r) }));
const missing=[];
const hit=all.find(r=>r.id===wanted)||null;
if(!hit) missing.push('no Hub Signals row with id '+wanted+' (paste the Signals record id into the Apify task payload as {signal})');
const f=hit?hit.f:{};
const list=(s)=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const clientLink=Array.isArray(f['Client'])?f['Client'][0]:'';
const client=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
const roles=list(f['Roles']);
const country=String(f['Country']||'').trim();
const maxEmployees=Number(f['Max Employees'])||0;
const icp=String(f['ICP']||'').trim();
if(hit){
  if(!client) missing.push('Client link on the Signals row');
  if(!roles.length) missing.push('Roles');
  if(!country) missing.push('Country');
  if(!maxEmployees) missing.push('Max Employees');
  if(!icp) missing.push('ICP');
}
return [{ json: {
  play: launch.play, signal: launch.signal, datasetId: launch.datasetId, tag: launch.tag||'',
  play_name: f['Name']||'', signal_row: hit?hit.id:'',
  client, event_type: String(f['Signal Type']||'hiring'),
  country, max_headcount: maxEmployees, icp_text: icp,
  roles,
  config_ok: missing.length===0, missing, guard:'play'
}}];
