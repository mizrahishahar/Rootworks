// Ark Batch Item: the AI-Ark pass for the batch that just closed, fired without waiting (no
// barrier, ruled 2026-09-02). Same companies as the writer batch, each carrying the held state the
// writer's recount returned (heldCount, heldKeys, heldLinkedin: what the base holds now, after
// the writer's rows landed), mode "ark", the same batchNum so its Hub row lands under
// "<parentExecId>-<batchNum>-ark", where the close waits for it.
const batch=$('Loop Batches').first().json;
const res=$('Run Batch').first().json||{};
const held=(res.held&&typeof res.held==='object')?res.held:{};
const companies=(Array.isArray(batch.companies)?batch.companies:[]).map(c=>{ const h=held[c.domain]||{ count:0, keys:[], linkedin:[] }; return { recordId:c.recordId, domain:c.domain, company:c.company, employees:c.employees, heldCount:Number(h.count)||0, heldKeys:Array.isArray(h.keys)?h.keys:[], heldLinkedin:Array.isArray(h.linkedin)?h.linkedin:[] }; });
return [{ json: {
  mode: 'ark',
  parentExecId: String($execution.id),
  batchNum: Number(batch.batchNum)||0, batchCount: Number(batch.batchCount)||0,
  base: batch.base, clientRecId: batch.clientRecId,
  peopleTableId: batch.peopleTableId, peopleTableName: batch.peopleTableName, companiesTableId: batch.companiesTableId, dncTableId: batch.dncTableId,
  peopleFields: batch.peopleFields,
  sources: batch.sources, cgDepartments: batch.cgDepartments, arkFunctions: batch.arkFunctions,
  companies: companies
} }];
