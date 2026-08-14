const init=$('Init Read Loop').first().json;
const sd=$getWorkflowStaticData('global');
const st=sd.hebSeed;
if(!st){ throw new Error('Read loop: the page accumulator is missing, the run lost its state. Nothing was written.'); }
const resp=$input.first().json||{};
if(!Array.isArray(resp.records)){ delete sd.hebSeed; throw new Error('Read loop: Airtable read failed on page '+(st.pages+1)+' of table '+init.tableId+': '+JSON.stringify(resp).slice(0,400)+'. Nothing was written.'); }
const HEB=/[\u0590-\u05FF]/;
const norm=function(v){ return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ').replace(/^[^\p{L}\p{N}]+/u,'').replace(/[^\p{L}\p{N}]+$/u,''); };
for(const r of resp.records){
  const f=r.fields||{};
  const rawFirst=String(f.first_name==null?'':f.first_name).trim();
  const rawLast=String(f.last_name==null?'':f.last_name).trim();
  const he=String(f.first_name_he==null?'':f.first_name_he).trim();
  const isHeb=String(f.hebrew_speaker==null?'':f.hebrew_speaker).trim().toLowerCase()==='hebrew';
  st.tuples.push([norm(rawFirst), rawFirst, he, norm(rawLast), rawLast, isHeb?1:0]);
}
st.scanned+=resp.records.length;
st.pages+=1;
const offset=String(resp.offset||'');
const capHit=st.pages>=1000;
const hasMore=(offset!=='')&&!capHit;
return [{ json: { baseId:init.baseId, tableId:init.tableId, qsBase:init.qsBase, qs: init.qsBase+(offset?('&offset='+encodeURIComponent(offset)):''), pages:st.pages, scanned:st.scanned, hasMore:hasMore, capHit:capHit } }];