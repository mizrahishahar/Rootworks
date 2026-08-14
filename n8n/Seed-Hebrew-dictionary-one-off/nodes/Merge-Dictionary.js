const a=$('Aggregate Dictionary').first().json;
const readRows=function(name){ try{ return $(name).all().map(function(i){ return i.json||{}; }).filter(function(r){ return r && r.id && r.fields; }); }catch(e){ return []; } };
const exG=new Map();
for(const r of readRows('AT Read Given Names')){ const f=r.fields||{}; const k=String(f.latin_key||'').trim(); if(k){ exG.set(k,f); } }
const exS=new Map();
for(const r of readRows('AT Read Surnames')){ const f=r.fields||{}; const k=String(f.latin_key||'').trim(); if(k){ exS.set(k,f); } }
let mergedGiven=0, mergedSurnames=0;
const conflictKeys=(a.conflictKeys||[]).slice();
const given=(a.given||[]).map(function(row){
  const ex=exG.get(row.latin_key);
  if(!ex){ return row; }
  mergedGiven++;
  const exOcc=Number(ex.occurrences)||0;
  const exHeb=String(ex.hebrew||'').trim();
  const exVars=String(ex.variants||'').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
  let hebrew=row.hebrew;
  let vars=String(row.variants||'').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
  let conflict=!!row.conflict;
  if(exHeb && exHeb!==hebrew){
    conflict=true;
    if(exOcc>row.occurrences){ vars.push(hebrew); hebrew=exHeb; } else { vars.push(exHeb); }
  }
  for(const v of exVars){ if(v){ vars.push(v); } }
  vars=Array.from(new Set(vars)).filter(function(v){ return v!==hebrew; });
  if(conflict && conflictKeys.indexOf(row.latin_key)<0){ conflictKeys.push(row.latin_key); }
  const status=(String(ex.status||'')==='verified')?'verified':'harvested';
  return { latin_key:row.latin_key, latin_display:row.latin_display, hebrew:hebrew, variants:vars.join('\n'), occurrences:exOcc+row.occurrences, conflict:conflict, status:status, source:row.source };
});
const surnames=(a.surnames||[]).map(function(row){
  const ex=exS.get(row.latin_key);
  if(!ex){ return { latin_key:row.latin_key, latin_display:row.latin_display, israeli_signal:row.israeli_signal, occurrences:row.occurrences, hebrew_share:row.hebrew_share, status:row.status, source:row.source }; }
  mergedSurnames++;
  const m=String(ex.hebrew_share||'').match(/^\s*([0-9]+)\s*\/\s*([0-9]+)\s*$/);
  const exHeb=m?Number(m[1]):0;
  const exTot=m?Number(m[2]):(Number(ex.occurrences)||0);
  const heb=row._heb+exHeb;
  const tot=row._total+exTot;
  const ratio=tot>0?(heb/tot):0;
  const signal=(ratio>=0.7)?'strong':((ratio>=0.4)?'weak':'none');
  const status=(String(ex.status||'')==='verified')?'verified':'harvested';
  return { latin_key:row.latin_key, latin_display:row.latin_display, israeli_signal:signal, occurrences:tot, hebrew_share:heb+'/'+tot, status:status, source:row.source };
});
return [{ json: Object.assign({}, a, { given:given, surnames:surnames, mergedGiven:mergedGiven, mergedSurnames:mergedSurnames, conflictKeys:conflictKeys }) }];