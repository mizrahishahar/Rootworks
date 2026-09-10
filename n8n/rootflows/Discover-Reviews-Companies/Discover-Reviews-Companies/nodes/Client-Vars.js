// Client Vars: the two things this Rootflow needs off the Hub Clients row, and nothing more
// (dead fields dropped 2026-09-10: clientSlug and Slack Channel ID, which no node read; this
// machine posts to no channel). A missing Clayroots Base ID is refused by Base OK?.
const r=$input.first().json||{};
const f=r.fields||r;
return [{ json: {
  clientName: f['Client']||'',
  clientRecId: r.id||$('Parse Play').first().json.client||'',
  base: f['Clayroots Base ID']||''
}}];
