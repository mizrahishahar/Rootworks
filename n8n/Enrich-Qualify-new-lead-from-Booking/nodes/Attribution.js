// One attribution record for a booker who was not in the CRM, from whichever tier claimed them.
let seq=null, src=null;
try{ seq=$('Assess Lead').first().json; }catch(e){}
try{ src=$('Assess Lists').first().json; }catch(e){}
const a=(seq&&seq.ours)?seq:((src&&src.ours)?src:null);
if(!a) return [{ json:{ tier:'', why:'unattributed', campaign:'', companyName:'', title:'' } }];
return [{ json:{ tier:a.tier, why:a.why, campaign:a.campaign||'', companyName:a.companyName||'', title:a.title||'', tableName:a.tableName||'' } }];
