// 2026-09-02: the poller is fired and not waited on, so it writes its own Hub row and needs the
// keys for it. parentExecId is THIS execution, which for a batched run is the batch sub-execution,
// so each batch's poller gets its own row instead of clobbering the last one; runExecId is the
// top-level run whose row already closed without these verdicts, named in the poller's Description.
const r=$('Read Records').first().json; const baseId=r._baseId; const tableId=r._tableId; const parentExecId=String($execution.id); const runExecId=String(r._execId||''); const out=[]; for(const it of $input.all()){ const v=it.json; if(v.Status==='verifying' && v._pendEmail){ out.push({ json:{ rowId:v.id, email:v._pendEmail, slot:v._pendSlot, tableId, baseId, parentExecId, runExecId } }); } } return out;
