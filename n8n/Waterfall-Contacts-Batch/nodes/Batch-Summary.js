// Batch Summary: the ONLY thing that crosses back into the parent: counters, never rows.
// A helper owns no run-log row; its outcome rolls up into the caller's row.
const plan=$('Plan Batch').first().json;
const zero=()=>({ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[] });
const grab=(n)=>{ try{ return Object.assign(zero(), $(n).first().json.stats||{}); }catch(e){ return zero(); } };
const cg=grab('Parse ContaGen'), sq=grab('Parse Supersoniq'), ark=grab('Parse Ark');
const bstats=(n)=>{ try{ const j=$(n).first().json||{}; return j._stats||{}; }catch(e){ return {}; } };
const bp1=bstats('Build People'), bp2=bstats('Build Ark People');
const rowsOf=(n)=>{ try{ return $(n).all().filter(i=>i.json&&!i.json._empty&&i.json['Contact Key']).length; }catch(e){ return 0; } };
const dnc=Math.max(0, rowsOf('Clean Fields')-rowsOf('Apply DNC'))+Math.max(0, rowsOf('Clean Ark Fields')-rowsOf('Apply Ark DNC'));
let written=0, writeErrors=0; const writtenByDomain={}; const failReasons=[];
const readUpsert=(n)=>{ try{ for(const it of $(n).all()){ const j=it.json||{}; if(j.id){ written++; const d=String((j.fields&&j.fields.Domain)||'').toLowerCase(); if(d) writtenByDomain[d]=(writtenByDomain[d]||0)+1; } else { writeErrors++; const e=j.error||{}; if(failReasons.length<5) failReasons.push('People upsert: '+String(e.description||e.message||j.message||'no record id came back').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,160)); } } }catch(e){} };
readUpsert('Upsert People'); readUpsert('Upsert Ark People');
let stamped=0, stampErrors=0;
try{ for(const it of $('Stamp Companies').all()){ const j=it.json||{}; if(j.id) stamped++; else stampErrors++; } }catch(e){}
let covered=0; const zeroDomains=[];
for(const c of plan.plan){ if(c.held+(writtenByDomain[c.domain]||0)>0) covered++; else if(zeroDomains.length<50) zeroDomains.push(c.domain); }
const ran=[cg,sq,ark].filter(s=>s.called>0);
const allFailed=ran.length>0&&ran.every(s=>s.errors>=s.called);
for(const s of [cg,sq,ark]) for(const r of (s.failReasons||[])) if(failReasons.length<10) failReasons.push(String(r));
const strip=(s)=>({ called:s.called, returned:s.returned, kept:s.kept, credits:s.credits, errors:s.errors, firstError:s.firstError||'' });
const n=(v)=>Number(v)||0;
return [{ json: {
  batchNum: plan.batchNum, batchCount: plan.batchCount, companiesIn: plan.plan.length,
  contagen: strip(cg), supersoniq: strip(sq), aiark: strip(ark),
  built: n(bp1.built)+n(bp2.built), heldSkipped: n(bp1.heldSkipped)+n(bp2.heldSkipped), dupes: n(bp1.dupes)+n(bp2.dupes), dnc: dnc,
  written: written, writeErrors: writeErrors, stamped: stamped, stampErrors: stampErrors,
  covered: covered, zero: plan.plan.length-covered, zeroDomains: zeroDomains,
  allFailed: allFailed, failReasons: failReasons
} }];
