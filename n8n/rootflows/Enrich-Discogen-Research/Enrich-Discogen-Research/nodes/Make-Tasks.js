// Make Tasks: one DiscoGen submit per 10,000 domains (the endpoint's ceiling), never split smaller
// and never in parallel: every task runs on the same LLM key and parallel tasks rate-limit each
// other (the discolike skill's law). The Prompt goes as written; with Evidence on, the two extra
// asks are appended as numbered questions, the one shape DiscoGen honors: it infers a JSON schema
// from the numbered questions and answers each domain with an object (proven 2026-09-12, run 24520;
// a "return JSON with these keys" instruction is ignored, run 24517, DiscoGen normalizes the answer
// to a bare value). Results maps the object back onto the three columns by its field labels.
// context_mode website: company profile plus homepage text, the richest context DiscoGen offers.
const p=$('Params').first().json;
const plan=$input.first().json||{};
if(plan._none||plan.refused) return [{ json:{ _none:true } }];
const SHAPE=' If the source does not say, answer unknown. 2. Quote one short verbatim sentence from the source that supports the answer, or write none. 3. Your confidence in the answer as a number from 0 to 1.';
const query=p.evidence?('1. '+p.prompt.replace(/^\s*1\.\s*/,'')+SHAPE):p.prompt;
const out=[];
const domains=plan.domains||[];
for(let i=0;i<domains.length;i+=10000){
  const part=domains.slice(i,i+10000);
  out.push({ json:{ idx:out.length, count:part.length, body:{ query, domains:part, context_mode:'website', web_search:!!p.webSearch } } });
}
return out;
