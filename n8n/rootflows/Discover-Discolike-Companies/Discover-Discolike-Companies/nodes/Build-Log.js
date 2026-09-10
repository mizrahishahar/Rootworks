// Build Log: one row per run, on the launch row, status computed from the helper's failed[] and the
// provider verdict, skips separated from errors, Client attached. The funnel is the pull's own
// counts plus the helper's counters (Insert domains to Clayroots). A DiscoLike that could not be
// reached (no credential, dead API) is a logged skip, never a crash: the row closes as Failed only
// when nothing could be pulled for that reason.
const p=$('Launch Params').first().json;
let stats={ pulled:0, no_domain:0, duplicate:0, providerErrors:0, providerReason:'' };
try{ const f=$('Format Companies').first().json||{}; if(f._stats) stats=Object.assign(stats, f._stats); }catch(e){}
let h=null; try{ h=$('Insert Domains').first().json||null; }catch(e){}
let fired=false, scope=0; try{ const fc=$('Fire Contacts').first().json||{}; fired=true; scope=(fc.Domains||[]).length; }catch(e){}
const n=(v)=>Number(v)||0;
const failed=(h&&Array.isArray(h.failed))?h.failed.slice():[];
const providerDown=!stats.pulled&&stats.providerErrors>0;
if(providerDown) failed.push({ name:'DiscoLike', reason:'DiscoLike could not be pulled: '+stats.providerReason });
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const tableName=(h&&h.tableName)||'Companies';
const lines=[
  '**'+stats.pulled+' companies pulled, '+n(h&&h.upserted)+' landed on '+tableName+' ('+n(h&&h.newDomains)+' new, '+n(h&&h.existingDomains)+' already held and refreshed)**',
  '',
  '**Source:** DiscoLike saved query '+p.queryId,
  '**Tag:** '+(p.tag||'none'),
  '**Rule:** every company the query answers is landed on Domain; a held company is refreshed with the new pull (Domain Source kept, Tag re-stamped); custom columns in the pull land as columns; DNC domains dropped',
  '',
  '**Funnel**',
  '- **Pulled:** '+stats.pulled,
  '- **Handed to the helper:** '+n(h&&h.in),
  '- **Landed (record id returned):** '+n(h&&h.upserted)+' ('+n(h&&h.newDomains)+' new, '+n(h&&h.existingDomains)+' already held)',
  '- **With public emails:** '+n(h&&h.withEmails)
];
if(h&&Array.isArray(h.createdColumns)&&h.createdColumns.length) lines.push('- **Columns created:** '+h.createdColumns.join(', '));
if(h&&Array.isArray(h.droppedKeys)&&h.droppedKeys.length) lines.push('- **Keys dropped:** '+h.droppedKeys.map(d=>d.key+' ('+d.why+')').join(', '));
lines.push('', '**Contacts:** '+(fired?('Enrich Contacts fired once on Companies view "Not Sourced", scoped to the '+scope+' domains of this pull; it writes its own launch row'):'not fired, nothing landed'));
const skips=[];
if(stats.no_domain) skips.push(stats.no_domain+' no domain');
if(stats.duplicate) skips.push(stats.duplicate+' duplicate domain in the pull');
if(h&&n(h.dnc)) skips.push(n(h.dnc)+' on the DNC table');
if(stats.providerErrors&&stats.pulled) skips.push(stats.providerErrors+' DiscoLike page(s) failed ('+stats.providerReason+')');
if(skips.length) lines.push('', '**Skipped ('+skips.join(', ')+')**');
if(failed.length){ const byReason={}; for(const f of failed){ byReason[f.reason]=(byReason[f.reason]||0)+1; } lines.push('', '**Failures ('+failed.length+')**'); for(const [r,c] of Object.entries(byReason).slice(0,10)) lines.push('- '+c+' x '+r); }
const log={
  'Automation':'Discover Discolike Companies',
  'Status': providerDown?'Failed':(failed.length?'Succeeded with errors':'Succeeded'),
  'Trigger':'form',
  'Errors': failed.length,
  'Run at': $now.toISO(),
  'Target': tableName+' ('+((h&&h.tableId)||'')+')',
  'Records In': stats.pulled,
  'Records Out': n(h&&h.upserted),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
