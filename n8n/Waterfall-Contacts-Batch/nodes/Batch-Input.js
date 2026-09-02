// Batch Input: the caller's passthrough item, one per call, exactly as the parent shaped it.
// Two modes, one machine (ruled 2026-09-02). Mode "writer": one 250-company batch through
// ContaGen and Supersoniq, Clean Fields, DNC, the People writer, the Companies stamps, a recount,
// its own Hub row keyed "<parentExecId>-<batchNum>", and the recount's held state back to the
// parent. Mode "ark": ONE pass for the whole run, fired by the parent, not awaited, once the
// writer lane has drained (rebuilt 2026-09-02; before that it was one pass per batch and the
// overlapping passes 429'd each other off AI-Ark's global ceiling). It carries every company from
// every closed writer batch with that batch's recount as held state, one AI-Ark export per company
// still under its band cap, completion through the callback door's data table, the People writer,
// no new stamps, its own Hub row keyed "<parentExecId>-ark" (the parent waits on that row).
// The key parts are required here, before any paid call; startedAt is the clock Duration s runs on.
const raw=$input.first().json||{};
const inp=Object.assign({}, raw);
const mode=String(inp.mode||'writer').toLowerCase()==='ark'?'ark':'writer';
const parentExecId=String(inp.parentExecId||'').trim();
const batchNum=Math.floor(Number(inp.batchNum)||0);
const who='Waterfall Contacts Batch ('+mode+')';
if(!parentExecId) throw new Error(who+' was called without parentExecId. Its Hub row is keyed by it. Nothing was pulled.');
if(mode==='writer'&&!(batchNum>0)) throw new Error(who+' '+parentExecId+' was called without batchNum. Its Hub row is keyed "<parentExecId>-<batchNum>". Nothing was pulled.');
if(!/^app[A-Za-z0-9]{14}$/.test(String(inp.base||''))) throw new Error(who+' '+parentExecId+' has no valid base. Nothing was pulled.');
for(const k of ['peopleTableId','companiesTableId']){ if(!inp[k]) throw new Error(who+' '+parentExecId+' has no '+k+'. Nothing was pulled.'); }
if(!Array.isArray(inp.companies)||!inp.companies.length) throw new Error(who+' '+parentExecId+' received an empty company list. The parent must never send one.');
inp.mode=mode;
inp.parentExecId=parentExecId;
inp.batchNum=batchNum;
inp.logKey=mode==='ark'?(parentExecId+'-ark'):(parentExecId+'-'+String(batchNum));
inp.startedAt=new Date().toISOString();
return [{ json: inp }];
