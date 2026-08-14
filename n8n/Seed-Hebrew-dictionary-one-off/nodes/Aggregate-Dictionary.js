const g=$('Guard Source Schema').first().json;
const sd=$getWorkflowStaticData('global');
const st=sd.hebSeed||{ tuples:[], pages:0, scanned:0 };
const tuples=st.tuples||[];
const pages=st.pages||0;
const scanned=st.scanned||0;
const capHit=!!($input.first().json.capHit);
delete sd.hebSeed;
const HEB=/[\u0590-\u05FF]/;
const source=g.tableName+' '+g.tableId;
let hebrewRows=0, skippedAlreadyHebrew=0, skippedJunk=0;
const gmap=new Map();
const smap=new Map();
for(const t of tuples){
  const fkey=t[0], fdisp=t[1], he=t[2], lkey=t[3], ldisp=t[4], isHeb=(t[5]===1);
  if(isHeb){ hebrewRows++; }
  if(lkey){ let s=smap.get(lkey); if(!s){ s={ display:ldisp, total:0, heb:0 }; smap.set(lkey,s); } s.total++; if(isHeb){ s.heb++; } }
  if(!isHeb){ continue; }
  if(!he){ continue; }
  if(!fdisp){ continue; }
  if(HEB.test(fdisp)){ skippedAlreadyHebrew++; continue; }
  if(fdisp.length<2 || fdisp.length>20 || fdisp.indexOf('@')>-1 || /[0-9]/.test(fdisp)){ skippedJunk++; continue; }
  if(!fkey){ skippedJunk++; continue; }
  let e=gmap.get(fkey);
  if(!e){ e={ display:fdisp, spellings:new Map(), total:0 }; gmap.set(fkey,e); }
  e.total++;
  e.spellings.set(he,(e.spellings.get(he)||0)+1);
}
const given=[]; const conflictKeys=[];
for(const entry of gmap){
  const key=entry[0]; const e=entry[1];
  const sorted=Array.from(e.spellings.entries()).sort(function(a,b){ return (b[1]-a[1]) || (a[0]<b[0]?-1:1); });
  const hebrew=sorted[0][0];
  const variants=sorted.slice(1).map(function(x){ return x[0]; });
  const conflict=variants.length>0;
  if(conflict){ conflictKeys.push(key); }
  given.push({ latin_key:key, latin_display:e.display, hebrew:hebrew, variants:variants.join('\n'), occurrences:e.total, conflict:conflict, status:'harvested', source:source });
}
const surnames=[]; let strongCount=0, weakCount=0, surnamesSkipped=0;
for(const entry of smap){
  const key=entry[0]; const s=entry[1];
  if(!key){ continue; }
  if(s.total<2){ surnamesSkipped++; continue; }
  const ratio=s.heb/s.total;
  let signal='';
  if(ratio>=0.7){ signal='strong'; } else if(ratio>=0.4){ signal='weak'; } else { surnamesSkipped++; continue; }
  if(signal==='strong'){ strongCount++; } else { weakCount++; }
  surnames.push({ latin_key:key, latin_display:s.display, israeli_signal:signal, occurrences:s.total, hebrew_share:s.heb+'/'+s.total, status:'harvested', source:source, _heb:s.heb, _total:s.total });
}
return [{ json: { baseId:g.baseId, tableId:g.tableId, tableName:g.tableName, startedAt:g.startedAt, source:source, pages:pages, scanned:scanned, capHit:capHit, hebrewRows:hebrewRows, skippedAlreadyHebrew:skippedAlreadyHebrew, skippedJunk:skippedJunk, surnamesSkipped:surnamesSkipped, strongCount:strongCount, weakCount:weakCount, conflictKeys:conflictKeys, given:given, surnames:surnames, accumulatorCleared:(sd.hebSeed===undefined) } }];