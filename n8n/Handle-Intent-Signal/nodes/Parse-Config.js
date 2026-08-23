// Parse Config: one shape for every play, read from the Apify webhook payload (body) or the
// task URL's query string. Nothing about a client is in this file; every knob below is a
// payload key, and the defaults are what a play gets when it does not say otherwise.
//
// Required: client (Hub Clients record id), table (Intent table id), campaign (enroll URL),
//           resource (Apify's own object, carries the dataset id).
// Knobs:    country (US), max_headcount (200), event_type (became_hiring),
//           and the decision-maker specs below.
//
// Decision-maker specs. Two per play by default, each a contact-source filter in both
// providers' own vocabulary. Override any list with a comma string, or replace the whole
// set with `specs` as a JSON array of {call, limit, cg:{seniority,department}, sq:{seniority,function}}.
//   tech_limit, tech_cg_seniority, tech_cg_department, tech_sq_seniority, tech_sq_function
//   exec_limit, exec_cg_seniority, exec_cg_department, exec_sq_seniority, exec_sq_function
// ContaGen enums: seniority executive|vp|director|manager|senior_ic; department is one of the
// 15 canonical DiscoLike values (Technology, Research & Development, Executive, Operations...).
// Supersoniq enums: seniority C-Suite|VP|Founder|Owner|President|EVP / SVP|Head|Director;
// function Engineering|R&D|Technology|Executive|Operations|...
//
// Apify's own `eventType` (ACTOR.RUN.SUCCEEDED) is deliberately NOT read: it leaked into
// Event Type on every row until 2026-08-23. Only the play's explicit event_type is honored.
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
const q=j.query||{}; const b=j.body||{};
const pick=(k)=>{ const v=(b[k]!==undefined&&b[k]!=='')?b[k]:q[k]; return (v===undefined||v===null)?'':(typeof v==='string'?v.trim():v); };
const num=(v,def)=>{ const n=parseInt(v,10); return Number.isFinite(n)&&n>0?n:def; };
const list=(v,def)=>{ if(Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean); const s=String(v||'').trim(); return s?s.split(',').map(x=>x.trim()).filter(Boolean):def; };

// DiscoLike's `executive` seniority is wide (proven live 2026-08-23: "Founding Growth",
// "Strategic Projects", CMO all carry it), so the exec spec also gates on title terms.
// Knobs per spec: {call}_cg_title, {call}_cg_negate_title (ContaGen only; Supersoniq has no title filter).
const DEFAULT_SPECS=[
  { call:'tech', limit:5,
    cg:{ seniority:['executive','vp','director','manager'], department:['Technology','Research & Development'], title:[], negate_title:[] },
    sq:{ seniority:['C-Suite','VP','Founder','Owner','President','EVP / SVP','Head','Director'], function:['Engineering','R&D','Technology'] } },
  { call:'exec', limit:3,
    cg:{ seniority:['executive'], department:['Executive'], title:['Founder','CEO','CTO','COO','President','Chief Executive','Chief Technology','Chief Operating'], negate_title:['marketing','sales','growth','revenue','people','talent','recruit','brand','community','content'] },
    sq:{ seniority:['C-Suite','Founder','Owner','President'], function:['Executive'] } }
];
const mkCg=(o,d)=>({ seniority:list(o&&o.seniority,d.seniority), department:list(o&&o.department,d.department), title:list(o&&o.title,d.title||[]), negate_title:list(o&&o.negate_title,d.negate_title||[]) });
let specs=null;
const rawSpecs=pick('specs');
if(rawSpecs){ try{ const arr=typeof rawSpecs==='string'?JSON.parse(rawSpecs):rawSpecs; if(Array.isArray(arr)&&arr.length) specs=arr.map(s=>({ call:String(s.call||'custom'), limit:num(s.limit,5), cg:mkCg(s.cg,{seniority:[],department:[],title:[],negate_title:[]}), sq:{ seniority:list(s.sq&&s.sq.seniority,[]), function:list(s.sq&&s.sq.function,[]) } })); }catch(e){} }
if(!specs){
  specs=DEFAULT_SPECS.map(d=>({ call:d.call, limit:num(pick(d.call+'_limit'),d.limit),
    cg:mkCg({ seniority:pick(d.call+'_cg_seniority'), department:pick(d.call+'_cg_department'), title:pick(d.call+'_cg_title'), negate_title:pick(d.call+'_cg_negate_title') }, d.cg),
    sq:{ seniority:list(pick(d.call+'_sq_seniority'),d.sq.seniority), function:list(pick(d.call+'_sq_function'),d.sq.function) } }));
}

const cfg={
  client: String(pick('client')||''),
  table: String(pick('table')||''),
  campaign_url: String(pick('campaign')||''),
  sender: String(pick('sender')||'webhook'),
  max_headcount: num(pick('max_headcount')||pick('maxHeadcount'),200),
  country: String(pick('country')||'US'),
  event_type: String(pick('event_type')||'became_hiring'),
  specs,
  datasetId: (b.resource&&b.resource.defaultDatasetId)||''
};
const missing=[];
if(!cfg.client) missing.push('client');
if(!cfg.table) missing.push('table');
if(!cfg.campaign_url) missing.push('campaign');
else if(!/^https?:\/\//i.test(cfg.campaign_url)) missing.push('campaign (not a URL)');
if(!cfg.datasetId) missing.push('resource.defaultDatasetId (Apify payload)');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
return [{ json: cfg }];
