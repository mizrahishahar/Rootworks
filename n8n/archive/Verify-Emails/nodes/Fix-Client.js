const log=Object.assign({},$('Build Log').first().json);
let rec=[];
try{ const lc=$('Fetch Launch Record').first().json.fields.Client; if(Array.isArray(lc)&&lc.length&&lc[0]) rec=[lc[0]]; }catch(e){}
if(!rec.length){ try{const rc=$('Resolve Client').first().json; if(rc&&rc.id)rec=[rc.id];}catch(e){} }
if(rec.length){ log['Client']=rec; } else { delete log['Client']; }
return [{json:log}];