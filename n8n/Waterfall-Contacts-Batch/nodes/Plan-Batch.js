// Plan Batch: the companies in, the plan out. People per company follows size, a rule in code
// (ruled 2026-09-02): 1-10 employees 4, 11-50 6, 51-200 10, 201 and up 12, unknown 6. The cap is
// a per-source cap at ContaGen and Supersoniq (every company in the batch, grouped by band so
// results_by_company and per_company_limit are the band cap) and absolute at AI-Ark (gap-sized,
// planned by the ark pass after one recount over the whole run). In mode "writer" the tier-1 and
// tier-2 requests are built here; in mode "ark" only the band caps are needed and no request is
// built. Pull WIDE, cut in the base: the nets here are fixed; who gets messaged is the relevance
// formula and the views on People. No Tag: People stores none (a lookup through Companies).
//
// TWO LEVERS ON THE LAUNCH ROW (ruled 2026-09-02), both carried here by the parent:
//   arkOnly, set when Tiers is the "AI-Ark" mode: a FLAT cap of five people per company, every
//   company size, instead of the band caps. Nothing else about the bands changes.
//   cgSeniority / sqSeniority, the launch row's Roles mapped into each provider's vocabulary by
//   the parent's Launch Params: present, they REPLACE the in-code seniority net for that provider
//   (including the 1-10 widening); absent, the in-code nets below stand unchanged.
const inp=$input.first().json||{};
const companies=Array.isArray(inp.companies)?inp.companies:[];
if(!companies.length) throw new Error('Waterfall Contacts Batch received an empty company list. The parent must never send one.');
const mode=inp.mode==='ark'?'ark':'writer';
const sources=Array.isArray(inp.sources)?inp.sources:[];
const on=(s)=>sources.indexOf(s)>-1;
const arkOnly=inp.arkOnly===true;
const ARK_ONLY_CAP=5;
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const capOf=(b)=>{ if(arkOnly) return ARK_ONLY_CAP; if(b==='1-10') return 4; if(b==='11-50') return 6; if(b==='51-200') return 10; if(b) return 12; return 6; };
const plan=companies.map(c=>{ const b=band(c.employees); return {
  recordId:c.recordId, domain:String(c.domain||'').trim().toLowerCase(), company:String(c.company||'').trim(),
  band:b||'unknown', small:b==='1-10', cap:capOf(b),
  held:Number(c.heldCount)||0,
  heldKeys:(Array.isArray(c.heldKeys)?c.heldKeys:[]).map(k=>String(k).toLowerCase()),
  heldLinkedin:(Array.isArray(c.heldLinkedin)?c.heldLinkedin:[]).map(l=>String(l).trim()).filter(Boolean)
}; }).filter(c=>c.domain);
// One group per (net, cap): 1-10 is the wider net at cap 4; an unknown band shares cap 6 with 11-50.
const groups={};
for(const c of plan){ const k=(c.small?'small':'standard')+':'+String(c.cap).padStart(2,'0'); (groups[k]=groups[k]||{ small:c.small, cap:c.cap, list:[] }).list.push(c); }
const chunk=(arr,n)=>{ const out=[]; for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; };
// Tier 1, ContaGen (DiscoLike contacts/discover, domain mode): seniority executive, vp, director,
// manager, plus senior_ic for 1-10; department only when the launch row mapped one; 250 domains per call.
const CG_SEN=['executive','vp','director','manager'];
const cgDep=Array.isArray(inp.cgDepartments)?inp.cgDepartments:[];
const cgRoles=Array.isArray(inp.cgSeniority)?inp.cgSeniority:[];
const sqRoles=Array.isArray(inp.sqSeniority)?inp.sqSeniority:[];
// Tier 2, Supersoniq companies/enrich: their vocabulary exactly as SQ Contacts Batch sends it
// (Unclassified included: "we don't know" is not "not a decision-maker"), Senior added for 1-10,
// no department, no country, tier full so the email rides, up to 1,000 domains per call.
const STANDARD_SEN=['Manager','Senior Manager','Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair','Unclassified'];
const SMALL_SEN=STANDARD_SEN.concat(['Senior']);
const cgRequests=[], sqRequests=[];
if(mode==='writer'){
  for(const k of Object.keys(groups).sort()){
    const g=groups[k];
    if(on('ContaGen')){
      for(const part of chunk(g.list,250)){
        const body={ domain:part.map(c=>c.domain), seniority:(cgRoles.length?cgRoles:(g.small?CG_SEN.concat(['senior_ic']):CG_SEN)), max_companies:part.length, results_by_company:g.cap };
        if(cgDep.length) body.department=cgDep;
        cgRequests.push({ body:body, domains:part.map(c=>c.domain), cap:g.cap });
      }
    }
    if(on('Supersoniq')){
      for(const part of chunk(g.list,1000)){
        sqRequests.push({ body:{ companies:part.map(c=>({ domain:c.domain })), filters:{ seniority:(sqRoles.length?sqRoles:(g.small?SMALL_SEN:STANDARD_SEN)) }, per_company_limit:g.cap, tier:'full' }, domains:part.map(c=>c.domain), cap:g.cap });
      }
    }
  }
}
return [{ json: {
  mode:mode, batchNum:Number(inp.batchNum)||0, batchCount:Number(inp.batchCount)||0,
  sources:sources, plan:plan, cgRequests:cgRequests, sqRequests:sqRequests,
  arkOnly:arkOnly, capRule:(arkOnly?('flat '+ARK_ONLY_CAP):'by band'),
  arkOn:mode==='ark'&&on('AI-Ark'), arkFunctions:(Array.isArray(inp.arkFunctions)?inp.arkFunctions:[]),
  arkSeniority:(Array.isArray(inp.arkSeniority)?inp.arkSeniority:[])
} }];
