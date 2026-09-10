// Resolve Mirror Row: the client base's Signals mirror row this Hub signal maps to, resolved
// BEFORE any paid call (Operator ruling 2026-09-02). No row, no relation: refuse here, nothing
// spent, nothing written. Emits the table facts (Find Companies Table) plus the mirror row id
// Format Companies links to.
//
// Matched on the signal's NAME (Operator ruling 2026-09-02, replacing a synced "Record ID" column
// that no client base ever carried). Strictness is what makes name matching safe, and it is not
// optional: exactly one row survives, or the run stops here with a named error saying what it
// looked for and what it found. A silent wrong guess is the failure mode this check exists to
// remove, and it is the reason name matching was accepted at all.
//
//   - Exact, trimmed name. Never a contains, never a fuzzy match.
//   - CASE-SENSITIVE. The Hub row's Name and the mirror row's Name are the same string carried
//     across by Airtable's own sync; nobody retypes it in between. So a case difference does not
//     mean "same signal, spelled loosely", it means these are two different Hub rows, and
//     resolving one to the other would be exactly the silent wrong guess. Refusing costs a named
//     error the Operator fixes in seconds; guessing costs a paid run written against the wrong
//     signal. The upstream query wraps the name in LOWER() on purpose, so a case-variant row
//     arrives here as a candidate and gets refused out loud instead of never being seen.
//   - Scoped to the client whenever the mirror carries a Client column, so two clients' signals
//     sharing a name cannot collide. A blank Client is not evidence of another owner, so such a
//     row stays a candidate; a Client naming a different client is, and that row is dropped.
//
// Reused verbatim from the hiring door.
const cfg=$('Parse Play').first().json;
const t=$('Find Companies Table').first().json;
const clientName=String(($('Client Vars').first().json||{}).clientName||'').trim();
const want=String(t.signalName||cfg.play_name||'').trim();
const where='the Signals mirror '+(t.signalsTableName||t.signalsTableId)+' in base '+t.base;
const rows=$input.all().map(i=>i.json||{}).filter(j=>j&&j.id);
const fieldsOf=(j)=>(j.fields&&typeof j.fields==='object')?j.fields:j;
const nameOf=(j)=>String(fieldsOf(j)['Name']||'').trim();
const clientOf=(j)=>{ const c=fieldsOf(j)['Client']; return String(Array.isArray(c)?(c[0]||''):(c||'')).trim(); };
const exact=rows.filter(j=>nameOf(j)===want);
const scoped=(t.mirrorHasClient&&clientName)?exact.filter(j=>{ const c=clientOf(j); return !c||c===clientName; }):exact;
if(scoped.length!==1){
  const show=(j)=>'"'+nameOf(j)+'"'+(clientOf(j)?' ['+clientOf(j)+']':' [no Client]')+' ('+j.id+')';
  let found;
  if(scoped.length===0){
    found=rows.length===0
      ? 'the mirror returned no row at all'
      : 'the mirror returned '+rows.length+' near miss(es) that did not survive the exact, case-sensitive'+(t.mirrorHasClient&&clientName?', client-scoped':'')+' check: '+rows.map(show).join(', ');
  } else {
    found=scoped.length+' rows carry that exact name: '+scoped.map(show).join(', ');
  }
  throw new Error('Cannot resolve Hub signal "'+want+'" (row '+cfg.signal_row+', client '+(clientName||'unknown')+') to exactly one row in '+where+': '+found+'. Matching is on the exact trimmed Name, case-sensitive'+(t.mirrorHasClient?', scoped to the client':', unscoped because the mirror carries no Client column')+'. Fix the Signals sync or the duplicate name, then re-fire. Nothing was spent or written.');
}
return [{ json: Object.assign({}, t, { mirrorId: scoped[0].id, mirrorName: nameOf(scoped[0]) }) }];
