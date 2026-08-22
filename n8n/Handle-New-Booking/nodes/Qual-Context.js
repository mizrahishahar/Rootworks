// The system prompt is the client's qualification-prompt KB row; the history is whatever the prospect already carries.
const c=$('Resolve Client').first().json;
const p=$('Resolve Prospect').first().json;
const n=$('Normalize Booking').first().json;
let kb='';
try{ const r=$input.first().json||{}; const f=r.fields||r; kb=String(f['Content']||'').replace(/\\([_*[\]`#|>~-])/g,'$1').trim(); }catch(e){}
const systemPrompt=kb||('You qualify inbound leads for '+c.clientName+', a B2B company. Decide whether the lead is a fit and return the structured JSON asked for.');
let title='', companyName='';
try{ const a=$('Attribution').first().json; title=a.title||''; companyName=a.companyName||''; }catch(e){}
const attributionLine=(p.tier==='Replied')?'They replied to our cold email earlier and are already in the CRM; now they booked.':(p.tier==='Sequenced')?('They never replied; they were in our cold email sequence ('+p.why+') and booked straight from it.'):(p.tier==='Sourced')?('They never replied and are not in the sequencer by this address; their company is on one of our lists for this client ('+p.why+'), so a colleague was emailed.'):'Attribution unknown.';
const history=[p.priorBrief?('Previous qualification: '+p.priorBrief):'', p.priorThread?('Conversation thread:\n'+p.priorThread):'', p.priorNotes?('Notes:\n'+p.priorNotes.slice(0,3000)):''].filter(Boolean).join('\n\n')||'(none)';
return [{ json:{ systemPrompt, kbFound:!!kb, title, companyName, attributionLine, history } }];
