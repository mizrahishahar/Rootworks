// Adapter: the helper's verdict in the shape Stamp Booked, Build Booking Card and Build Run Log read through
// $('Flatten Verdict'). The judging lives in Enrich and Qualify Lead; the booking's own lines (the contextNotes
// entry, the attribution line) are composed here.
const q=$input.first().json||{};
const n=$('Normalize Booking').first().json;
const p=$('Resolve Prospect').first().json;
const status=String(q.qualification_status||'');
const qualificationStatus=q.qualification_label||'Needs Review';
const vreason=String(q.verdict_reason||'');
const when=(n.startTime||'').slice(0,16).replace('T',' ');
const line='Booked via '+n.source+' on '+$now.toFormat('yyyy-MM-dd')+': '+(n.title||'(untitled)')+' at '+(when||'?')+(n.meetingUrl?' | '+n.meetingUrl:'')+'. Attribution: '+(p.tier||'Unattributed')+(p.why?' ('+p.why+')':'')+'. Verdict: '+qualificationStatus+(vreason?' ('+vreason+')':'')+'.';
const contextNotes=((p.priorNotes||'').trim()?(p.priorNotes.trim()+'\n\n'):'')+line;
return [{ json:{ qualificationStatus, verdict:status, verdictReason:vreason, briefMd:q.brief_md||'', brief:q.brief||'', situation:q.situation_summary||'', recommended:q.recommended_action||'', timezone:String(q.timezone||''), companyName:String(q.company_name||''), contextNotes, attributionLine:line, kbFound:q.kb_found!==false, baseSource:q.base_source||'', baseMatch:q.base_match||'', baseReason:q.base_reason||'' } }];
