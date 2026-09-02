// Plan Scaffold Pass: one pass of the idempotent scaffold. Reads the base's live schema, walks
// the register (Scaffold Register) in order and emits one meta-API call per thing that is missing
// and creatable now: a table with its plain fields (primary first), or a single field. The
// dependencies set the order: People after Companies; the People link before the People lookups;
// the inverse link before the Companies count and rollup; the mirror link before the mirror
// lookup that reads through it; a formula after the fields it names;
// DNC after the People link. What exists is left alone and counted as a skip. A column of
// another type, or a case variant of the name, is a clash: reported, never retyped or renamed.
// A mirror link whose "<Client> Signals" / "<Client> Campaigns" table is absent is a counted
// skip, as is anything that depends on it. The declared extras groups the launch picked
// (Scaffold Init, S.extras) walk with their table's own fields, deduplicated by name (Trustpilot
// Rating sits in two groups); an unpicked group is never touched. Emits {_done:true} when nothing
// is left, or when what is left can never resolve (those land in failed). A create that failed is
// never retried. A field kind the planner does not know is not a dependency: it fails on the first
// pass, naming the kind and the field, so a register mistake surfaces at once instead of hanging.
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
const OK={ singleLineText:['singleLineText','multilineText','richText','email','url','phoneNumber'], multilineText:['multilineText','richText','singleLineText'], singleSelect:['singleSelect'], dateTime:['dateTime','date'], date:['date','dateTime'], number:['number','currency','percent'], checkbox:['checkbox'], url:['url','singleLineText'], formula:['formula'], link:['multipleRecordLinks'], mirrorLink:['multipleRecordLinks'], lookup:['multipleLookupValues'], mirrorLookup:['multipleLookupValues'], count:['count'], rollup:['rollup'] };
// Every field kind this planner knows, in one place, so a kind it does not know is caught by name
// instead of falling through. Two holes it closes, both paid for by the mirrorLookup kind added
// 2026-09-03: resolve() had no default branch, so an unknown kind slid into the lookup/count/rollup
// tail, read a missing `via`, resolved a table by undefined, deferred every pass and ended as
// `stuck: true` with a message naming nothing; and OK carried no entry for it, so the fallback
// compared the KIND to the Airtable TYPE and reported every already-correct field as a clash on
// every rerun. A kind outside this list is a register mistake, never a dependency that might
// arrive later, so it fails on the first pass with the kind and the field named.
const KINDS=['plain','formula','link','mirrorLink','mirrorLookup','lookup','count','rollup'];
const unknownKind=(k,where)=>'unknown field kind "'+String(k)+'" on register field '+where+'. This planner knows '+KINDS.join(', ')+'. Add a branch to resolve() and an accepted-types entry to OK (here and in the Onboard Client twin of this file) before the register uses it.';
const mark=(key,state,line)=>{ if(S.seen[key]) return; S.seen[key]=state; if(state==='existed') S.existed.push(key); else if(state==='skipped') S.skipped.push(line); else S.failed.push(line); };
const plainBody=(f)=>{ const o={ name:f.name, type:f.type }; if(f.options) o.options=f.options; return o; };
// The picked extras groups' fields for a table, after its own register fields, one field per name.
const picked=new Set(S.extras||[]);
const fieldsOf=(T)=>{ const seen=new Set(T.fields.map(f=>f.name)); const out=T.fields.slice(); for(const g of (REG.extras||[])){ if(g.table!==T.name||!picked.has(g.group)) continue; for(const f of g.fields){ if(seen.has(f.name)) continue; seen.add(f.name); out.push(f); } } return out; };

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
  if(f.kind==='mirrorLookup'){
    // Like a lookup, but through the mirror link on this table, not through the Companies link:
    // the mirror is found by its own name, the link to it by that table's id, the source column
    // inside the mirror by name. The mirror is the Operator's synced table, so a missing mirror
    // and a mirror without the column are both counted skips, never a wait that can never resolve.
    const m=mirrorTable(f.mirror);
    if(!m) return { skip:'no "'+S.clientName+' '+f.mirror+'" table in the base yet; the Operator syncs the mirror from the Hub, then adds this lookup by hand' };
    const govKey=T.name+'.'+f.mirror;
    const link=linkTo(t,m.id);
    if(!link){ const st=S.seen[govKey]; return gone(st)?{ skip:'needs the link '+govKey+', which '+st }:{ defer:'waits for the link '+govKey }; }
    const src=fieldExact(m,f.field);
    if(!src) return { skip:'looks up '+f.field+' on "'+m.name+'", which the synced mirror does not carry; the Operator adds the column to the sync, then adds this lookup by hand' };
    return { body:{ name:f.name, type:'multipleLookupValues', options:{ recordLinkFieldId: link.id, fieldIdInLinkedTable: src.id } } };
  }
  // The default branch. Only lookup, count and rollup reach the tail below; anything else is a
  // register mistake and fails here by name rather than resolving a table by undefined.
  if(f.kind!=='lookup'&&f.kind!=='count'&&f.kind!=='rollup') return { fail: unknownKind(f.kind, T.name+'.'+f.name) };
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
  const fields=fieldsOf(T);
  if(!t){
    if(gone(S.seen[tkey])) continue;
    const waits=(T.after||[]).filter(d=>{
      const dt=tableByName(d.table);
      if(!dt) return !gone(S.seen[d.table+'.(table)']);
      if(!d.field||fieldExact(dt,d.field)) return false;
      return !gone(S.seen[d.table+'.'+d.field]);
    });
    if(waits.length){ deferred.push({ key:tkey, why:'waits for '+waits.map(d=>d.table+(d.field?'.'+d.field:'')).join(', ') }); continue; }
    const plain=fields.filter(f=>f.kind==='plain');
    const primary=plain.find(f=>f.name===T.primary)||plain[0];
    const tableFields=[primary].concat(plain.filter(f=>f!==primary)).map(plainBody);
    calls.push({ key:tkey, table:T.name, name:'(table)', kind:'table', fieldNames:tableFields.map(f=>f.name), method:'POST', url:urlTables, body:{ name:T.name, fields:tableFields } });
    continue;
  }
  mark(tkey,'existed');
  for(const f of fields){
    const key=T.name+'.'+f.name;
    // Ahead of the existence check, so an unknown kind fails once and clearly instead of reporting
    // an already-correct column as a clash on every rerun.
    if(KINDS.indexOf(f.kind)<0){ mark(key,'failed', key+': '+unknownKind(f.kind, key)); continue; }
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
    if(spec.fail){ mark(key,'failed', key+': '+spec.fail); continue; }
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
