// Parse Play: the play row (KB Files, Type intent-play) into the run's config. Every line
// below is required except linkedin / email, of which at least one must be present. A missing
// or unreadable line stops the run before any paid call. Nothing about a client exists in code.
// Airtable rich text escapes markdown, so \_ and friends are unescaped first.
//
//   table: tblXXXXXXXXXXXXXX
//   event: became_hiring
//   companies: US | max 200 employees | we sell to: <ICP sentence>
//   roles: <title terms counted as "already in the role", comma list>
//   people: <title terms we keep, comma list> | never <terms> | <N> per company
//   linkedin: <Alta pull-in URL>                       or tiers: first hire = yes -> <url> | rest -> <url>
//   email: <PlusVibe campaign id>                      or tiers, same grammar
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

let country='', maxEmployees=0, icp='';
const comp=need('companies');
if(comp){
  for(const p of comp.split('|').map(s=>s.trim())){
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

const roles=list(need('roles'));
if(lines['roles']&&!roles.length) missing.push('roles: empty');

let titles=[], never=[], cap=0;
const ppl=need('people');
if(ppl){
  for(const p of ppl.split('|').map(s=>s.trim())){
    let m;
    if((m=p.match(/^never\s+(.+)$/i))) never=list(m[1]);
    else if((m=p.match(/^(\d+)\s+per company$/i))) cap=Number(m[1]);
    else if(!titles.length) titles=list(p);
    else missing.push('people: unreadable part "'+p+'"');
  }
  if(!titles.length) missing.push('people: titles');
  if(!cap) missing.push('people: N per company');
}

// A channel line is one target, or tiers: "<rule> -> <target> | rest -> <target>".
// Rules: first hire = yes|no|unknown. Targets: Alta pull-in URL for linkedin, PlusVibe campaign id for email.
const channel=(key,isTarget,label)=>{
  const s=lines[key]; if(!s) return null;
  const tiers=[];
  const parts=s.split('|').map(x=>x.trim()).filter(Boolean);
  if(parts.length===1&&!/->/.test(parts[0])){ if(!isTarget(parts[0])) missing.push(key+': not a '+label); return [{ kind:'rest', target:parts[0] }]; }
  for(const p of parts){
    const m=p.match(/^(.+?)\s*->\s*(\S+)$/);
    if(!m){ missing.push(key+': unreadable "'+p+'"'); continue; }
    const rule=m[1].trim().toLowerCase(); const target=m[2];
    if(!isTarget(target)){ missing.push(key+': "'+target+'" is not a '+label); continue; }
    let r;
    if(rule==='rest') tiers.push({ kind:'rest', target });
    else if((r=rule.match(/^first hire\s*=\s*(yes|no|unknown)$/))) tiers.push({ kind:'first_hire', value:r[1], target });
    else missing.push(key+': unknown rule "'+rule+'"');
  }
  if(!tiers.some(t=>t.kind==='rest')) missing.push(key+': no rest rule');
  return tiers;
};
const linkedin=channel('linkedin',(t)=>/^https?:\/\//i.test(t),'URL');
const email=channel('email',(t)=>!/^https?:\/\//i.test(t)&&t.length>0,'PlusVibe campaign id');
if(!linkedin&&!email) missing.push('linkedin or email (at least one channel)');
if(lines['tiers']) missing.push('tiers: retired, write the tiers on the linkedin: or email: line');

const launch=$('Parse Launch').first().json;
return [{ json: {
  play: launch.play, datasetId: launch.datasetId, kvStoreId: launch.kvStoreId, sender: launch.sender,
  play_name: f['Name']||'', client, table, event_type: event,
  country, max_headcount: maxEmployees, icp_text: icp,
  roles,
  people: { titles, never, cap },
  channels: { linkedin: linkedin||[], email: email||[] },
  config_ok: missing.length===0, missing, guard:'play'
}}];
