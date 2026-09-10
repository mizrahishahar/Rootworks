// 2026-09-02: the poller is fired and not waited on, so it writes its own Hub row and needs the key
// for it. parentExecId is this run's execution, the same one its own log row is keyed on; the
// poller's row is that id suffixed "-bounceban". This machine does not batch, so there is no
// separate runExecId to send.
const baseId=$('Params In').first().json['Clayroots Base ID']; const tableId=$('Resolve Table').first().json.tableId; const parentExecId=String($execution.id); const out=[]; for(const it of $input.all()){ const v=it.json; if(v.Status==='verifying' && v._pendEmail){ out.push({ json:{ rowId:v.id, email:v._pendEmail, slot:v._pendSlot, tableId, baseId, parentExecId } }); } } return out;
