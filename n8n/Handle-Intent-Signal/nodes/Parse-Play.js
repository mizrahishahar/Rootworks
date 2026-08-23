// Parse Play: the play row (KB Files, Type intent-play) into the run's config. Four lines,
// every one required; a missing or unreadable line stops the run before any paid call.
// Nothing about a client exists in code: country, size cap, ICP sentence, titles, cap, tiers
// all come from this cell. Airtable rich text escapes markdown, so \_ and friends are unescaped.
//
//   table: tblXXXXXXXXXXXXXX
//   event: became_hiring
//   companies: US | max 200 employees | we sell to: <ICP sentence>
//   people: <title terms, comma list> | never <terms, comma list> | <N> per company
//   tiers: first hire = yes -> <url> | first hire = no -> <url> | rest -> <url>
const row=$input.first().json||{};
const f=row.fields||row;
const raw=String(f['Content']||'').replace(/\\([_*#\[\]()~`>\-|])/g,'$1').replace(/\r/g,'');
const clientLink=Array.isArray(f['Client'])?f['Client'][0]:'';
const client=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
const missing=[];
const lines={};
for(const ln of raw.split('\n')){ const m=ln.match(/^\s*([a-z]+)\s*:\s*(.*)$/i); if(m) lines[m[1].toLowerCase()]=m[2].trim(); }
const need=(k)=>{ if(!lines[k]){ missing.push(k); return ''; } return lines[k]; };
const list=(s)=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);

if(!client) missing.push('Client link on the play row');
const table=need('table'); if(table&&!/^tbl[A-Za-z0-9]{14}$/.test(table)) missing.push('table (not a tbl id)');
const event=need('event');

// companies: <country> | max <N> employees | we sell to: <sentence>
let country='', maxEmployees=0, icp='';
const comp=need('companies');
if(comp){
  const parts=comp.split('|').map(s=>s.trim());
  for(const p of parts){
    let m;
    if((m=p.match(/^max\s+(\d+)\s+employees$/i))) maxEmployees=Number(m[1]);
    else if((m=p.match(/^we sell to\s*:\s*(.+)$/i))) icp=m[1].trim();
    else if(/^[A-Z]{2}$/.test(p)) country=p;
    else missing.push('companies: unreadable part "'+p+'"');
  }
  if(!country) missing.push('companies: country');
  if(!maxEmployees) missing.push('companies: max N employees');
  if(!icp) missing.push('companies: we sell to');
}

// people: <titles> | never <terms> | <N> per company
let titles=[], never=[], cap=0;
const ppl=need('people');
if(ppl){
  const parts=ppl.split('|').map(s=>s.trim());
  for(const p of parts){
    let m;
    if((m=p.match(/^never\s+(.+)$/i))) never=list(m[1]);
    else if((m=p.match(/^(\d+)\s+per company$/i))) cap=Number(m[1]);
    else if(!titles.length) titles=list(p);
    else missing.push('people: unreadable part "'+p+'"');
  }
  if(!titles.length) missing.push('people: titles');
  if(!cap) missing.push('people: N per company');
}

// tiers: <rule> -> <url> | ... ; rules: first hire = yes|no|unknown, rest
const tiers=[];
const tr=need('tiers');
if(tr){
  for(const p of tr.split('|').map(s=>s.trim())){
    const m=p.match(/^(.+?)\s*->\s*(https?:\/\/\S+)$/i);
    if(!m){ missing.push('tiers: unreadable "'+p+'"'); continue; }
    const rule=m[1].trim().toLowerCase(); const url=m[2];
    let r;
    if(rule==='rest') tiers.push({ kind:'rest', url });
    else if((r=rule.match(/^first hire\s*=\s*(yes|no|unknown)$/))) tiers.push({ kind:'first_hire', value:r[1].charAt(0).toUpperCase()+r[1].slice(1), url });
    else missing.push('tiers: unknown rule "'+rule+'"');
  }
  if(!tiers.some(t=>t.kind==='rest')) missing.push('tiers: no rest rule');
}

const launch=$('Parse Launch').first().json;
return [{ json: {
  play: launch.play, datasetId: launch.datasetId, kvStoreId: launch.kvStoreId, sender: launch.sender,
  play_name: f['Name']||'', client, table, event_type: event,
  country, max_headcount: maxEmployees, icp_text: icp,
  people: { titles, never, cap },
  tiers,
  config_ok: missing.length===0, missing, guard:'play'
}}];
