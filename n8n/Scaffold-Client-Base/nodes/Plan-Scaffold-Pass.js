// Shared origin: a verbatim copy of n8n/Onboard-Client/nodes/Plan-Scaffold-Pass.js. Onboard Client
// is the source; change it there and copy here (n8n cannot reference a code file across folders).
// Plan Scaffold Pass: one pass of the idempotent scaffold. Reads the base's live schema, walks
// the register (Scaffold Register) in order and emits one meta-API call per thing that is missing
// and creatable now: a table with its plain fields (primary first), or a single field. The
// dependencies set the order: People after Companies; the People link before the People lookups;
// the inverse link before the Companies count and rollup; a formula after the fields it names;
// DNC after the People link. What exists is left alone and counted as a skip. A column of
// another type, or a case variant of the name, is a clash: reported, never retyped or renamed.
// A mirror link whose "<Client> Signals" / "<Client> Campaigns" table is absent is a counted
// skip, as is anything that depends on it. Emits {_done:true} when nothing is left, or when what
// is left can never resolve (those land in failed). A create that failed is never retried.
const sd=$getWorkflowStaticData('global'); const S=sd.scaffold;
const REG=$('Scaffold Register').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
S.pass=(S.pass||0)+1;
const done=(extra)=>{ S.pending=[]; return [{ json: Object.assign({ _done:true, pass:S.pass }, extra||{}), pairedItem:{ item:0 } }]; };
if(!tables){ S.failed.push('schema read, pass '+S.pass+': '+JSON.stringify(body).slice(0,200)); return done({ stuck:true }); }
if(S.pass>8){ S.failed.push('scaffold stopped after 8 passes with work still planned'); return done({ stuck:true }); }

const ci=(s)=>String(s||'').trim().toLowerCase();
const tableByName=(n)=>tables.find(t=>ci(t.name)===ci(n));
const fieldExact=(t,n)=>(t.fields||[]).find(f=>f.name===n);
const fieldCI=(t,n)=>(t.fields||[]).find(f=>ci(f.name)===ci(n));
const linkTo=(t,targetId)=>(t.fields||[]).find(f=>f.type==='multipleRecordLinks'&&f.options&&f.options.linkedTableId===targetId);
const registerNames=new Set(REG.tables.map(t=>ci(t.name)));
const mirrorTable=(kind)=>{
  const exact=tableByName(S.clientName+' '+kind); if(exact) return exact;
  const tail=new RegExp('(^|\\s)'+kind.toLowerCase()+'$');
  const found=tables.filter(t=>!registerNames.has(ci(t.name))&&tail.test(ci(t.name)));
  return found.length===1?found[0]:null;
};
const gone=(st)=>st==='failed'||st==='clash'||st==='skipped';
// Types a register field may already carry and still count as present. Never retyped.
const OK={ singleLineText:['singleLineText','multilineText','richText','email','url','phoneNumber'], multilineText:['multilineText','richText','singleLineText'], singleSelect:['singleSelect'], dateTime:['dateTime','date'], date:['date','dateTime'], number:['number','currency','percent'], checkbox:['checkbox'], url:['url','singleLineText'], formula:['formula'], link:['multipleRecordLinks'], mirrorLink:['multipleRecordLinks'], lookup:['multipleLookupValues'], count:['count'], rollup:['rollup'] };
const mark=(key,state,line)=>{ if(S.seen[key]) return; S.seen[key]=state; if(state==='existed') S.existed.push(key); else if(state==='skipped') S.skipped.push(line); else S.failed.push(line); };
const plainBody=(f)=>{ const o={ name:f.name, type:f.type }; if(f.options) o.options=f.options; return o; };

function resolve(f,T,t){
  if(f.kind==='plain') return { body: plainBody(f) };
  if(f.kind==='formula'){
    let formula=f.formula;
    for(const ref of f.refs||[]){
      const rf=fieldExact(t,ref);
      if(!rf){ const st=S.seen[T.name+'.'+ref]; return gone(st)?{ skip:'references '+ref+', which '+st }:{ defer:'waits for '+ref }; }
      formula=formula.split('{'+ref+'}').join('{'+rf.id+'}');
    }
    return { body:{ name:f.name, type:'formula', options:{ formula:formula } } };
  }
  if(f.kind==='link'){
    const target=tableByName(f.table);
    if(!target){ const st=S.seen[f.table+'.(table)']; return gone(st)?{ skip:'links to '+f.table+', which '+st }:{ defer:'waits for table '+f.table }; }
    return { body:{ name:f.name, type:'multipleRecordLinks', options:{ linkedTableId: target.id } } };
  }
  if(f.kind==='mirrorLink'){
    const m=mirrorTable(f.mirror);
    if(!m) return { skip:'no "'+S.clientName+' '+f.mirror+'" table in the base yet; the Operator syncs the mirror from the Hub, then adds this link by hand' };
    return { body:{ name:f.name, type:'multipleRecordLinks', options:{ linkedTableId: m.id } } };
  }
  // lookup, count, rollup: through the link between this table and f.via, found by table id.
  const target=tableByName(f.via);
  const govKey=(f.kind==='lookup')?(T.name+'.'+f.via):(f.via+'.'+T.name);
  if(!target){ const st=S.seen[f.via+'.(table)']; return gone(st)?{ skip:'needs table '+f.via+', which '+st }:{ defer:'waits for table '+f.via }; }
  const link=linkTo(t,target.id);
  if(!link){ const st=S.seen[govKey]; return gone(st)?{ skip:'needs the link '+govKey+', which '+st }:{ defer:'waits for the link '+govKey }; }
  if(f.kind==='count') return { body:{ name:f.name, type:'count', options:{ recordLinkFieldId: link.id } } };
  const src=fieldExact(target,f.field);
  if(!src){ const st=S.seen[f.via+'.'+f.field]; return gone(st)?{ skip:'looks up '+f.via+'.'+f.field+', which '+st }:{ defer:'waits for '+f.via+'.'+f.field }; }
  if(f.kind==='lookup') return { body:{ name:f.name, type:'multipleLookupValues', options:{ recordLinkFieldId: link.id, fieldIdInLinkedTable: src.id } } };
  return { body:{ name:f.name, type:'rollup', options:{ recordLinkFieldId: link.id, fieldIdInLinkedTable: src.id, formula: f.formula } } };
}

const urlTables='https://api.airtable.com/v0/meta/bases/'+S.base+'/tables';
const calls=[]; const deferred=[];
for(const T of REG.tables){
  const t=tableByName(T.name);
  const tkey=T.name+'.(table)';
  if(!t){
    if(gone(S.seen[tkey])) continue;
    const waits=(T.after||[]).filter(d=>{
      const dt=tableByName(d.table);
      if(!dt) return !gone(S.seen[d.table+'.(table)']);
      if(!d.field||fieldExact(dt,d.field)) return false;
      return !gone(S.seen[d.table+'.'+d.field]);
    });
    if(waits.length){ deferred.push({ key:tkey, why:'waits for '+waits.map(d=>d.table+(d.field?'.'+d.field:'')).join(', ') }); continue; }
    const plain=T.fields.filter(f=>f.kind==='plain');
    const primary=plain.find(f=>f.name===T.primary)||plain[0];
    const fields=[primary].concat(plain.filter(f=>f!==primary)).map(plainBody);
    calls.push({ key:tkey, table:T.name, name:'(table)', kind:'table', fieldNames:fields.map(f=>f.name), method:'POST', url:urlTables, body:{ name:T.name, fields:fields } });
    continue;
  }
  mark(tkey,'existed');
  for(const f of T.fields){
    const key=T.name+'.'+f.name;
    const expect=(f.kind==='plain')?f.type:f.kind;
    const ex=fieldExact(t,f.name);
    if(ex){
      if((OK[expect]||[expect]).indexOf(ex.type)>=0) mark(key,'existed');
      else mark(key,'clash', key+': exists as '+ex.type+', the register wants '+expect+' (left alone, never retyped)');
      continue;
    }
    const cv=fieldCI(t,f.name);
    if(cv){ mark(key,'clash', key+': the table carries "'+cv.name+'", a case variant (left alone, never renamed)'); continue; }
    if(gone(S.seen[key])) continue;
    const spec=resolve(f,T,t);
    if(spec.skip){ mark(key,'skipped', key+': '+spec.skip); continue; }
    if(spec.defer){ deferred.push({ key:key, why:spec.defer }); continue; }
    calls.push({ key:key, table:T.name, name:f.name, kind:f.kind, method:'POST', url:urlTables+'/'+t.id+'/fields', body:spec.body });
  }
}
if(!calls.length){
  for(const d of deferred) mark(d.key,'failed', d.key+': never became creatable ('+d.why+')');
  return done({ stuck: deferred.length>0 });
}
S.pending=calls.map(c=>({ key:c.key, table:c.table, name:c.name, kind:c.kind, fieldNames:c.fieldNames||[] }));
return calls.map(c=>({ json: c, pairedItem:{ item:0 } }));
