// Params: one shape for both entries. Whichever entry ran wrote its item; this re-emits it so every
// node after reads $('Params') and never cares which door opened the run.
let p=null;
try{ p=$('Launch Params').first().json; }catch(e){}
if(!p||(!p.base&&!p.refused)){ try{ p=$('Event Params').first().json; }catch(e){} }
if(!p) throw new Error('Enrich Contact Counts: no entry produced launch parameters.');
return [{ json:p }];
