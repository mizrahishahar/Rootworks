let prospectId='', priorNotes='', existed=false;
try{ const f=$('Find Prospect').first().json; if(f&&f.id){ prospectId=f.id; const ff=f.fields||f; priorNotes=ff.contextNotes||''; existed=true; } }catch(e){}
if(!prospectId){ try{ prospectId=$('Create Prospect').first().json.id||''; }catch(e){} }
let ours='', why='';
try{ const a=$('Assess Lead').first().json; ours=a.ours; why=a.why||''; }catch(e){}
return [{ json:{ prospectId, priorNotes, existed, createdFromSequencer:!existed&&!!prospectId, why } }];
