const q=$('Build Contact Query').first().json;
const clientName=q.clientName||'Unknown Client';
const slug=clientName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const channelName=slug + '-private';
const emails=[];
for(const item of $input.all()){
  const j=item.json||{};
  const e=j.email||(j.fields&&j.fields.email)||'';
  if(e)emails.push(e);
}
const sections=['Offer & info source','Infrastructure','List building','Outreach','Sequencer','Copy','Scheduler','Inbox management','Automations','Communication'];
const overrides='# Overrides - ' + clientName + '\n\n' + sections.map(s => '## ' + s).join('\n\n') + '\n';
// Extras: the declared extras groups the scaffold creates on Companies (Storeleads, Hiring,
// Reviews), picked on the onboarding call as ?extras=Storeleads,Hiring (or body.extras, a list or
// a comma-separated string). Blank means the register core only. Scaffold Init validates the picks.
let extras=[];
try{
  const w=$('Onboard Webhook').first().json||{};
  const raw=(w.query&&w.query.extras)||(w.body&&w.body.extras)||'';
  extras=(Array.isArray(raw)?raw:String(raw).split(',')).map(x=>String(x).trim()).filter(Boolean);
}catch(e){}
return [{ json: { clientName, slug, channelName, emails, overrides, extras, prospectId: q.prospectId } }];
