// Batch Input: the caller's passthrough item, one per call, exactly as the parent shaped it.
// Two modes, one machine (ruled 2026-09-02). Mode "writer": one 250-company batch through
// ContaGen and Supersoniq, Clean Fields, DNC, the People writer, the Companies stamps, a recount,
// its own Hub row keyed "<parentExecId>-<batchNum>", and the recount's held state back to the
// parent. Mode "ark": fired by the parent, not awaited, the moment that writer batch closed: the
// same companies with the recount's held state on them, one AI-Ark export per company still
// under its band cap, completion through the callback door's data table, the People writer, no
// new stamps, its own Hub row keyed "<parentExecId>-<batchNum>-ark" (the parent waits on those
// rows). The key parts are required here, before any paid call; startedAt is the clock Duration s
// runs on.
const raw=$input.first().json||{};
const inp=Object.assign({}, raw);
const mode=String(inp.mode||'writer').toLowerCase()==='ark'?'ark':'writer';
const parentExecId=String(inp.parentExecId||'').trim();
const batchNum=Math.floor(Number(inp.batchNum)||0);
const who='Waterfall Contacts Batch ('+mode+')';
if(!parentExecId) throw new Error(who+' was called without parentExecId. Its Hub row is keyed by it. Nothing was pulled.');
if(!(batchNum>0)) throw new Error(who+' '+parentExecId+' was called without batchNum. Its Hub row is keyed "<parentExecId>-<batchNum>'+(mode==='ark'?'-ark':'')+'". Nothing was pulled.');
if(!/^app[A-Za-z0-9]{14}$/.test(String(inp.base||''))) throw new Error(who+' '+parentExecId+' has no valid base. Nothing was pulled.');
for(const k of ['peopleTableId','companiesTableId']){ if(!inp[k]) throw new Error(who+' '+parentExecId+' has no '+k+'. Nothing was pulled.'); }
if(!Array.isArray(inp.companies)||!inp.companies.length) throw new Error(who+' '+parentExecId+' received an empty company list. The parent must never send one.');
inp.mode=mode;
inp.parentExecId=parentExecId;
inp.batchNum=batchNum;
inp.logKey=parentExecId+'-'+String(batchNum)+(mode==='ark'?'-ark':'');
inp.startedAt=new Date().toISOString();
return [{ json: inp }];
