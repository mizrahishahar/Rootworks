let prospect_id='', prior_notes='', existed=false;
try{const f=$('Find Prospect').first().json; if(f&&f.id){prospect_id=f.id; prior_notes=f.contextNotes||''; existed=true;}}catch(e){}
if(!prospect_id){try{prospect_id=$('Create Prospect').first().json.id||'';}catch(e){}}
return [{json:{prospect_id, prior_notes, existed}}];