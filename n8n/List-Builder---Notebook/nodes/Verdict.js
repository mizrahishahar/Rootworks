
const row = $('Read Contacts').item.json;
const tk = $('Trykitt Find').item.json || {};
const mv = $('MillionVerifier').item.json || {};
let bb = {};
try { bb = $('BounceBan').item.json || {}; } catch (e) { bb = {}; }
const tkEmail = (tk.email && tk.email !== 'no-results-found') ? tk.email : '';
const mvResult = mv.result || '';
let final_email='', email_source='', final_verdict='none', status='no_email_found';
if (tkEmail) {
  if (mvResult === 'ok') { final_email=tkEmail; email_source='trykitt'; final_verdict='ok'; status='done'; }
  else if (mvResult === 'catch_all') {
    const bbState = bb.state || bb.result || '';
    if (bbState === 'deliverable') { final_email=tkEmail; email_source='trykitt'; final_verdict='catchall_deliverable'; status='done'; }
  }
}
return { json: { ...row, trykitt_email: tk.email || '', trykitt_validity: tk.validity || '', mv_result: mvResult, mv_quality: mv.quality || '', mv_role: mv.role || '', bb_state: bb.state || '', bb_score: bb.score == null ? '' : bb.score, final_email, email_source, final_verdict, status } };