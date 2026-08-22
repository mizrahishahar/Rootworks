let prospectId='', priorNotes='', priorThread='', priorBrief='', existed=false, tier='', why='';
try{ const f=$('Find Prospect').first().json; if(f&&f.id){ prospectId=f.id; const ff=f.fields||f; priorNotes=String(ff.contextNotes||''); priorThread=String(ff['Conversation Thread']||''); priorBrief=String(ff['Qualification Brief']||''); existed=true; tier='Replied'; why='already a prospect of this client (replied before)'; } }catch(e){}
if(!prospectId){ try{ prospectId=$('Create Prospect').first().json.id||''; }catch(e){} try{ const a=$('Attribution').first().json; tier=a.tier||''; why=a.why||''; }catch(e){} }
return [{ json:{ prospectId, priorNotes, priorThread:priorThread.slice(0,6000), priorBrief:priorBrief.slice(0,1500), existed, tier, why } }];
