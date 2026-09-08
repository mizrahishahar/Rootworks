// Plan Batch: the companies in, the plan out. Ruled 2026-09-08: every provider is asked for every
// company; the only shaping is a cap per provider and a seniority floor, both read off the
// Employees value already on OUR Companies row (sources disagree on headcount, so the provider's
// own size is never consulted), in three coarse tiers so a one-band disagreement changes nothing:
//   up to 50 employees, or unknown   cap 20 per provider   floor "wide": everyone non-junior, senior ICs too
//   51 to 500                        cap 30 per provider   floor "nonjunior": everyone non-junior
//   501 and up                       cap 50 per provider   floor "manager": manager and up
// 50 is the ceiling because GetLeads' max_per_company hard-stops there. Each provider sub-workflow
// translates the floor into its own vocabulary. Pull WIDE, cut in the base: who gets messaged is
// the relevance formula and the views on People. No Tag: People stores none (a lookup).
const inp=$input.first().json||{};
const companies=Array.isArray(inp.companies)?inp.companies:[];
if(!companies.length) throw new Error('Enrich Contacts Batch received an empty company list. The parent must never send one.');
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s+]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const tier=(b)=>{ if(!b||b==='1-10'||b==='11-50') return { cap:20, floor:'wide' }; if(b==='51-200'||b==='201-500') return { cap:30, floor:'nonjunior' }; return { cap:50, floor:'manager' }; };
const plan=companies.map(c=>{ const b=band(c.employees); const t=tier(b); return {
  recordId:c.recordId, domain:String(c.domain||'').trim().toLowerCase(), company:String(c.company||'').trim(),
  band:b||'unknown', cap:t.cap, floor:t.floor,
  heldRows:Array.isArray(c.heldRows)?c.heldRows:[]
}; }).filter(c=>c.domain);
const tiers={ wide:0, nonjunior:0, manager:0 }; for(const c of plan) tiers[c.floor]++;
return [{ json: {
  batchNum:Number(inp.batchNum)||0, batchCount:Number(inp.batchCount)||0,
  plan:plan, companies:plan.map(c=>({ recordId:c.recordId, domain:c.domain, company:c.company, band:c.band, cap:c.cap, floor:c.floor })),
  tiers:tiers, capRule:'up to 50 employees or unknown: 20 wide; 51 to 500: 30 non-junior; 501 and up: 50 manager and up'
} }];
