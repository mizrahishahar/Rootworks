// Batch Input: the caller's passthrough item, one per call, exactly as the parent shaped it: one
// batch of companies (100, ruled 2026-09-08) with what People already holds at their domains, the
// base and table ids, and the key of the Hub row this pass writes: "<parentExecId>-<batchNum>".
// One mode, one machine (rebuilt 2026-09-08 as the Enrich Contacts Rootflow): every provider
// sub-workflow is asked for every company, the answers are merged on Contact Key and LinkedIn
// slug, the People writer upserts, the companies are stamped, a recount reports coverage.
// The key parts are required here, before any paid call; startedAt is the clock Duration s runs on.
const raw=$input.first().json||{};
const inp=Object.assign({}, raw);
const parentExecId=String(inp.parentExecId||'').trim();
const batchNum=Math.floor(Number(inp.batchNum)||0);
const who='Enrich Contacts Batch';
if(!parentExecId) throw new Error(who+' was called without parentExecId. Its Hub row is keyed by it. Nothing was pulled.');
if(!(batchNum>0)) throw new Error(who+' '+parentExecId+' was called without batchNum. Its Hub row is keyed "<parentExecId>-<batchNum>". Nothing was pulled.');
if(!/^app[A-Za-z0-9]{14}$/.test(String(inp.base||''))) throw new Error(who+' '+parentExecId+' has no valid base. Nothing was pulled.');
for(const k of ['peopleTableId','companiesTableId']){ if(!inp[k]) throw new Error(who+' '+parentExecId+' has no '+k+'. Nothing was pulled.'); }
if(!Array.isArray(inp.companies)||!inp.companies.length) throw new Error(who+' '+parentExecId+' received an empty company list. The parent must never send one.');
inp.parentExecId=parentExecId;
inp.batchNum=batchNum;
inp.logKey=parentExecId+'-'+String(batchNum);
inp.startedAt=new Date().toISOString();
return [{ json: inp }];
