const sd=$getWorkflowStaticData('global');
let eid=String($execution.id); try{ eid=String($('Read Records').first().json._execId||eid); }catch(e){}
if(!sd._wfFinderFails||sd._wfFinderFails.execId!==eid){ sd._wfFinderFails={execId:eid,p1:0,p2:0,p3:0,causes:{}}; }
const a=sd._wfFinderFails;
return $input.all().map(i=>{ const j={...i.json};
 if(j._errP1) a.p1++;
 if(j._errP2) a.p2++;
 if(j._errP3) a.p3++;
 if(j._failCauses){ for(const c of String(j._failCauses).split('|')){ if(c) a.causes[c]=(a.causes[c]||0)+1; } }
 for(const k of Object.keys(j)){ if(k.charAt(0)==='_') delete j[k]; }
 return {json:j}; });