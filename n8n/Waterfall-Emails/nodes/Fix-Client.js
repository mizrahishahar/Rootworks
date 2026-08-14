const j=Object.assign({},$json);
let rec=[];
try{ const cid=$('Read Records').first().json._clientId; if(cid) rec=[cid]; }catch(e){}
if(rec.length){ j['Client']=rec; } else { delete j['Client']; }
return {json:j};