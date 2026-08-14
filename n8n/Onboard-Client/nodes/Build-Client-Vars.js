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
return [{ json: { clientName, slug, channelName, emails, overrides, prospectId: q.prospectId } }];