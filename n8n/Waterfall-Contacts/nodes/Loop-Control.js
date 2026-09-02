// Loop Control: reads one batch summary, adds it to the running totals held in the run row's
// Tally (read-add-write: static data never survives sub-executions, the row is the
// accumulator), and writes a live Running row. A batch whose paid tiers all died, after the
// HTTP nodes' own retry, fails loud here with the totals so far.
const res=$('Run Batch').first().json||{};
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
let row={}; try{ row=$('Read Tally').first().json||{}; }catch(e){}
const zero=()=>({ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'' });
let t={ batches:0, companies:0, contagen:zero(), supersoniq:zero(), aiark:zero(), built:0, heldSkipped:0, dupes:0, dnc:0, written:0, writeErrors:0, stamped:0, stampErrors:0, covered:0, zero:0, zeroDomains:[], failReasons:[] };
// A launch row is reused across runs: only a Tally stamped with THIS execution id is ours; anything else is a previous run's and starts from zero.
try{ const raw=(row.fields&&row.fields.Tally)||''; if(raw){ const parsed=JSON.parse(raw); if(parsed&&typeof parsed==='object'&&String(parsed.executionId||'')===String($execution.id)) t=Object.assign(t, parsed); } }catch(e){}
t.executionId=String($execution.id);
const n=(v)=>Number(v)||0;
const batchNum=n(res.batchNum);
if(res.allFailed){ throw new Error('Waterfall Contacts batch '+batchNum+' had every paid call fail after retry ('+String((res.failReasons&&res.failReasons[0])||'no reason captured').slice(0,200)+'). Totals so far: '+t.companies+' companies, '+t.written+' people written across '+t.batches+' batches.'); }
t.batches+=1; t.companies+=n(res.companiesIn);
for(const k of ['contagen','supersoniq','aiark']){ const s=res[k]||{}; const d=t[k]||zero(); d.called+=n(s.called); d.returned+=n(s.returned); d.kept+=n(s.kept); d.credits+=n(s.credits); d.errors+=n(s.errors); if(!d.firstError&&s.firstError) d.firstError=String(s.firstError).slice(0,300); t[k]=d; }
for(const k of ['built','heldSkipped','dupes','dnc','written','writeErrors','stamped','stampErrors','covered','zero']) t[k]=n(t[k])+n(res[k]);
t.zeroDomains=(Array.isArray(t.zeroDomains)?t.zeroDomains:[]).concat(Array.isArray(res.zeroDomains)?res.zeroDomains:[]).slice(0,50);
t.failReasons=Array.isArray(t.failReasons)?t.failReasons:[];
for(const x of (Array.isArray(res.failReasons)?res.failReasons:[])){ if(t.failReasons.length<10) t.failReasons.push(String(x).slice(0,200)); }
let total=0; try{ total=n(($('Make Batches').first().json._stats||{}).companiesIn); }catch(e){}
const out={
  'Execution ID': String($execution.id),
  'Automation': 'Waterfall Contacts',
  'Trigger': p.trigger||'form',
  'Status': 'Running',
  'Run at': p.startedAt,
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'Records In': total,
  'Records Out': t.written,
  'Tally': JSON.stringify(t),
  'Description': '**Running: batch '+t.batches+' of '+n(res.batchCount)+', '+t.companies+' of '+total+' companies worked, '+t.written+' people written**',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) out['Client']=[p.clientRecId];
return [{ json: out }];
