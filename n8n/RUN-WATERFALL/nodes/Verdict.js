
const row = $('Read Records').item.json;
const f = row.fields || {};
const G = (n) => { try { return $(n).item.json || {}; } catch(e){ return {}; } };
const mvE = G('MV Existing'); const tk = G('Trykitt Find'); const mvP = G('MV P1'); const bbP = G('BB P1');
const existing = f.Email || '';
const tkEmail = (tk.email && tk.email !== 'no-results-found') ? tk.email : '';
let finalEmail='', source='', status='no_email_found';
if (existing && mvE.result === 'ok') { finalEmail = existing; source = 'existing'; status = 'done'; }
if (!finalEmail && tkEmail) {
  if (mvP.result === 'ok') { finalEmail = tkEmail; source = 'trykitt'; status = 'done'; }
  else if (mvP.result === 'catch_all' && bbP.state === 'deliverable') { finalEmail = tkEmail; source = 'trykitt'; status = 'done'; }
}
return { json: { id: row.id, 'MV existing': mvE.result || '', 'BB existing': '', 'Trykitt P1': tk.email || '', 'MV P1': mvP.result || '', 'BB P1': bbP.state || '', 'Final Email': finalEmail, Source: source, Status: status } };