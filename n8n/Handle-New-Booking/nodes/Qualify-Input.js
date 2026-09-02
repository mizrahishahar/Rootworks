// Builds the passthrough item for Enrich and Qualify Lead (the contract is documented at the top of that
// helper's Build Prompt node). The booking's own context, the attribution line and the history the prospect
// row already carries, is composed here; the rubric lookup, DiscoLike and the judge live in the helper.
const n=$('Normalize Booking').first().json||{};
const c=$('Resolve Client').first().json||{};
const p=$('Resolve Prospect').first().json||{};
let title='', companyName='';
try{ const a=$('Attribution').first().json||{}; title=a.title||''; companyName=a.companyName||''; }catch(e){}
const attributionLine=(p.tier==='Replied')?'They replied to our cold email earlier and are already in the CRM; now they booked.':(p.tier==='Sequenced')?('They never replied; they were in our cold email sequence ('+p.why+') and booked straight from it.'):(p.tier==='Sourced')?('They never replied and are not in the sequencer by this address; their company is on one of our lists for this client ('+p.why+'), so a colleague was emailed.'):'Attribution unknown.';
const history=[p.priorBrief?('Previous qualification: '+p.priorBrief):'', p.priorThread?('Conversation thread:\n'+p.priorThread):'', p.priorNotes?('Notes:\n'+String(p.priorNotes).slice(0,3000)):''].filter(Boolean).join('\n\n')||'(none)';
const context=[
  'WHAT HAPPENED: this person BOOKED A CALL on the client\'s scheduler ('+(n.source||'')+'): "'+(n.title||'')+'" at '+(n.startTime||'')+'.\nHOW WE GOT HERE: '+attributionLine,
  'PRIOR HISTORY WITH THIS PROSPECT (thread and notes, may be empty for a cold booker):\n'+history,
  'BOOKING NOTES THEY LEFT:\n'+(n.notes||'(none)')
].join('\n\n');
return [{ json:{
  client_name:c.clientName||'',
  first_name:n.firstName||'', last_name:n.lastName||'', job_title:title, company_name:companyName,
  lead_email:n.email||'', linkedin_url:'',
  domain:n.domain||'', enrich_domain:n.domain||'', is_freemail:!n.domain,
  city:'', state:'', country_code:'',
  situation_ask:'what the booking signals and what they want from the call',
  context
} }];
