// Ark Lane: the whole AI-Ark tier of the run, planned once, after the writer lane drained
// (rebuilt 2026-09-02 after execution 7954 on Dave.io). Before: one AI-Ark pass per writer batch,
// fired unawaited, so eight passes overlapped, each pacing itself as if it were alone; together
// they crossed AI-Ark's global ceiling (5 requests per second, 300 per minute) and about 1,679 of
// 1,699 calls came back HTTP 429 for twenty people. After: one pass for the whole run, so the
// pacing inside it is the run's pacing and nothing else is talking to AI-Ark while it works.
// It carries every company from every writer batch that CLOSED, each with the held state that
// batch's recount returned (the gap AI-Ark is sized to; Ark Plan drops the ones already at cap and
// excludes the LinkedIn URLs the base already holds). A batch that crashed or died on every paid
// call is left out, exactly as it was before. Fired, not awaited; the close waits for the lane's
// Hub row "<parentExecId>-ark".
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const passes=runs('Pass Result').map(r=>r[0].json||{});
const answers=runs('Run Batch').map(r=>r[0].json||{});
// The batch items as Make Batches dealt them: batchNum -> the 250 companies it carried.
const byNum={};
try{ for(const it of $('Make Batches').all()){ const j=it.json||{}; byNum[Number(j.batchNum)||0]=j; } }catch(e){}
const companies=[]; const batchNums=[];
for(let i=0;i<passes.length;i++){
  const pass=passes[i]||{};
  if(pass.status!=='closed') continue;
  const n=Number(pass.batchNum)||0; const b=byNum[n]; if(!b) continue;
  // The writer's recount for that batch, per domain: what the base held once its rows landed.
  // Missing (the recount itself failed) falls back to the run's tier-zero count, never to zero.
  const a=answers[i]||{};
  const held=(a.held&&typeof a.held==='object')?a.held:{};
  batchNums.push(n);
  for(const c of (b.companies||[])){
    const h=held[c.domain];
    companies.push({
      recordId: c.recordId, domain: c.domain, company: c.company, employees: c.employees,
      heldCount: h?(Number(h.count)||0):(Number(c.heldCount)||0),
      heldKeys: (h&&Array.isArray(h.keys))?h.keys:(Array.isArray(c.heldKeys)?c.heldKeys:[]),
      heldLinkedin: (h&&Array.isArray(h.linkedin))?h.linkedin:(Array.isArray(c.heldLinkedin)?c.heldLinkedin:[])
    });
  }
}
const arkOn=(p.sources||[]).indexOf('AI-Ark')>-1;
return [{ json: {
  fire: arkOn&&companies.length>0,
  batchNums: batchNums,
  companiesIn: companies.length,
  mode: 'ark',
  parentExecId: String($execution.id),
  batchNum: 0, batchCount: batchNums.length,
  base: p.base, clientRecId: p.clientRecId,
  peopleTableId: cfg.peopleTableId, peopleTableName: cfg.peopleTableName, companiesTableId: cfg.companiesTableId, dncTableId: cfg.dncTableId,
  peopleFields: cfg.peopleFields,
  tiers: p.tiers, sources: p.sources, arkOnly: p.arkOnly, roles: p.roles,
  cgDepartments: p.cgDepartments, arkFunctions: p.arkFunctions,
  cgSeniority: p.cgSeniority, sqSeniority: p.sqSeniority, arkSeniority: p.arkSeniority,
  companies: companies
} }];
