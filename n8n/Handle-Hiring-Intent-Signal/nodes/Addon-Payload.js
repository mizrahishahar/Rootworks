let cv=null; try{ cv=$('Client Vars').first().json; }catch(e){}
if(!cv||!cv.clientSlug) return [];
const cfg=$('Parse Play').first().json||{};
let upserted=0;
try{ upserted+=$('Upsert by Email').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
try{ upserted+=$('Upsert by Name+Domain').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
return [{ json: {
  recordId: cv.clientRecId||cfg.client||'',
  clientSlug: cv.clientSlug||'',
  base: cv.base||'', table: cfg.table||'', campaign_url: cfg.campaign_url||'', sender: cfg.sender||'webhook',
  upserted: upserted
}}];