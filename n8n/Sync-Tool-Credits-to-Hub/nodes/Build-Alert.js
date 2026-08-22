// One Slack line when any tool sits under its Operator-set floor; nothing otherwise.
let rows=[]; try{ rows=$('Upsert Credits').all().map(i=>i.json).filter(r=>r&&(r.id||r.fields)); }catch(e){}
const low=rows.map(r=>r.fields||r).filter(f=>f.Alert===1||f.Alert===true);
if(!low.length) return [];
const text=':warning: *Tool credits low*\n'+low.map(f=>'• *'+f.Tool+':* '+f.Credits+' '+(f.Unit||'')+' (floor '+f['Alert Below']+(f['Days Left']?', ~'+f['Days Left']+' days left':'')+')').join('\n');
return [{ json:{ text } }];
