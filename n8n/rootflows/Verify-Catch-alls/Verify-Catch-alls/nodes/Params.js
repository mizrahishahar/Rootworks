// Params: one shape for both entries.
let p=null;
try{ p=$('Launch Params').first().json; }catch(e){}
if(!p||!p.base){ try{ p=$('Event Params').first().json; }catch(e){} }
if(!p||!p.base) throw new Error('Verify Catch-alls: no entry produced parameters.');
return [{ json:p }];
