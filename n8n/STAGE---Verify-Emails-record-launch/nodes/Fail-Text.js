const items=$input.all();
function ext(e){ if(!e) return ''; if(typeof e==='string') return e; return e.message||e.description||JSON.stringify(e); }
let msg='';
for(const it of items){
  msg = ext(it.error)||ext(it.json&&it.json.error);
  if(msg) break;
}
if(!msg){ try{ msg='Failed with no error payload. First item: '+JSON.stringify(items[0].json).slice(0,500); }catch(e){ msg='Run failed; see execution log.'; } }
return [{ json:{ msg } }];