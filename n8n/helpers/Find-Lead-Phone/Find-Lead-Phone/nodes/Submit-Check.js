// Submit Check: FullEnrich's answer to the submission becomes the poll carrier: the enrichment id, or
// the reason there is none. No credential on the node, a refused key, no credits, a rate limit or a
// dead API are all a named skip on the batch, never a crash: the people it carried stay retryable.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object
// with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const j=$input.first().json||{};
const carrier={ enrichmentId:'', submitErr:'', status:'', polls:0, _force:false, _loop:false, _t0:Date.now() };
if(j.error&&j.body===undefined&&j.enrichment_id===undefined){
  const m=errMsg(j.error);
  carrier.submitErr=(/credential/i.test(m)?'FullEnrich: no credential on the FullEnrich nodes':'FullEnrich: '+m).slice(0,200);
  return [{ json:carrier }];
}
const code=Number(j.statusCode)||200;
let b=(j.body!==undefined)?j.body:j;
if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b={ message:b }; } }
b=b||{};
if(code>=200&&code<300&&b.enrichment_id){ carrier.enrichmentId=String(b.enrichment_id); carrier.status='CREATED'; return [{ json:carrier }]; }
const why=String(b.code||'')+' '+String(b.message||'');
if(code===401||/authorization|api\.key/i.test(why)) carrier.submitErr='FullEnrich: the API key was refused (HTTP '+code+' '+why.trim()+')';
else if(code===402||/credit/i.test(why)) carrier.submitErr='FullEnrich: out of credits (HTTP '+code+' '+why.trim()+')';
else if(code===429) carrier.submitErr='FullEnrich: rate limited at submit (HTTP 429 '+why.trim()+')';
else carrier.submitErr=('FullEnrich: submit refused (HTTP '+code+' '+(why.trim()||JSON.stringify(b).slice(0,120))+')');
carrier.submitErr=carrier.submitErr.slice(0,200);
return [{ json:carrier }];
