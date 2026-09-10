// Params: one shape for both Rootflow entries. Whichever entry ran wrote its item; this re-emits it
// so every node after reads $('Params') and never cares which door opened the run.
let p=null;
try{ p=$('Launch Params').first().json; }catch(e){}
if(!p||!p.base){ try{ p=$('Event Params').first().json; }catch(e){} }
if(!p||!p.base) throw new Error('Enrich Phones: no entry produced launch parameters.');
return [{ json:p }];
