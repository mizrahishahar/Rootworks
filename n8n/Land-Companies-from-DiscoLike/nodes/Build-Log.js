// Build Log: one row per run on the launch row, status computed from failed[], skips
// separated from errors, Client attached (a launched run serves exactly one client).
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Companies Table').first().json||{}; }catch(e){}
let stats={ pulled:0, no_domain:0, duplicate:0, kept:0 };
try{ const f=$('Format Companies').first().json||{}; if(f._stats) stats=f._stats; }catch(e){}
const failed=[];
let upserted=0;
try{ for(const it of $('Upsert Companies').all()){ const j=it.json||{}; if(j.id) upserted++; else failed.push({ name: (j.fields&&j.fields.Domain)||'row', reason: String(j.error||'no record id came back').slice(0,120) }); } }catch(e){}
if(stats.kept&&upserted<stats.kept&&!failed.length){ failed.push({ name:'upsert', reason:(stats.kept-upserted)+' rows returned no record id' }); }
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const lines=[
  '**'+stats.pulled+' companies pulled, '+upserted+' upserted into '+(cfg.tableName||'Companies')+'**',
  '',
  '**Source:** DiscoLike saved query '+p.queryId,
  '**Tag:** '+(p.tag||'none'),
  '',
  '**Funnel**',
  '- **Pulled:** '+stats.pulled,
  '- **Kept:** '+stats.kept,
  '- **Upserted (record id returned):** '+upserted
];
const skips=[]; if(stats.no_domain) skips.push(stats.no_domain+' no domain'); if(stats.duplicate) skips.push(stats.duplicate+' duplicate domain in the pull');
if(skips.length) lines.push('', '**Skipped ('+skips.join(', ')+')**');
if(failed.length){ lines.push('', '**Failures**'); for(const f of failed.slice(0,10)) lines.push('- '+f.name+': '+f.reason); }
const log={
  'Automation':'Land Companies from DiscoLike',
  'Status': failed.length?'Succeeded with errors':'Succeeded',
  'Trigger':'form',
  'Errors': failed.length,
  'Run at': $now.toISO(),
  'Target': (cfg.tableName||'Companies')+' ('+(cfg.tableId||'')+')',
  'Records In': stats.pulled,
  'Records Out': upserted,
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
