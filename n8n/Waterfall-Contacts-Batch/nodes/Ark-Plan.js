// Ark Plan: tier 3 is absolute, sized to the gap the base still showed when the writer batch that
// covered each company closed: the parent's Ark Lane passes that batch's recount as held state on
// every company (heldCount, heldKeys, heldLinkedin, carried into the plan by Plan Batch), so no
// read happens here. One lane per run since 2026-09-02, never one pass per batch. Only
// companies under their band cap, size = cap minus held, the LinkedIn URLs held at that domain
// excluded (contact.linkedin.any.exclude, verified in their docs 2026-09-02). One export per
// company. Export People with Email: 0.5 credits per person plus 0.5 per email found. Completion
// comes through the callback door: the export's webhook is AI-Ark Export Callback's door with the
// parent execution id as ?run=, and that door records every call into the data table Read
// Callbacks polls.
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
// Seniority enum verified in docs 2026-09-02 (people-export-with-email): founder, owner, partner,
// c_suite, vp, director, head, manager, senior, mid-level, entry, intern. The contract's "cxo" is c_suite.
// Three settings, in this order of precedence (ruled 2026-09-02):
//   1. the launch row's Roles, mapped into AI-Ark's vocabulary by the parent's Launch Params;
//   2. the AI-Ark-only mode (Tiers = "AI-Ark"), the intent path: the real buyers only, since that
//      lane carries the whole run on a flat cap of five people per company;
//   3. the full waterfall's wider net, where AI-Ark is the third tier over what the first two left.
const SENIORITY=['founder','owner','partner','c_suite','vp','head','director','manager'];
const ARK_ONLY_SENIORITY=['founder','owner','partner','c_suite','vp'];
// The export endpoint requires an HTTPS webhook (verified in docs). The door is AI-Ark Export
// Callback (POST /webhook/ai-ark-export-noop), which answers 200 at once and records the call.
const WEBHOOK='https://n8n.flowroots.com/webhook/ai-ark-export-noop?run='+encodeURIComponent(String(inp.parentExecId||''));
const functions=Array.isArray(plan.arkFunctions)?plan.arkFunctions:[];
const roleSeniority=Array.isArray(plan.arkSeniority)?plan.arkSeniority:[];
const seniority=roleSeniority.length?roleSeniority:(plan.arkOnly?ARK_ONLY_SENIORITY:SENIORITY);
const requests=[]; const heldOut={};
if(plan.arkOn){
  for(const c of plan.plan){
    const h={ count:Number(c.held)||0, keys:Array.isArray(c.heldKeys)?c.heldKeys:[], linkedin:Array.isArray(c.heldLinkedin)?c.heldLinkedin:[] };
    heldOut[c.domain]=h;
    const gap=c.cap-h.count; if(gap<=0) continue;
    const exclude=Array.from(new Set(h.linkedin.filter(u=>/linkedin\.com\/in\//i.test(u))));
    const contact={ seniority:{ any:{ include:seniority } } };
    if(exclude.length) contact.linkedin={ any:{ exclude:exclude } };
    // contact.departmentAndFunction.any.include (key and nesting verified in docs); values come from
    // the parent's mapping of the launch row's Departments into AI-Ark's taxonomy, never guessed here.
    if(functions.length) contact.departmentAndFunction={ any:{ include:functions } };
    requests.push({ domain:c.domain, gap:gap, body:{ account:{ domain:{ any:{ include:[c.domain] } } }, contact:contact, page:0, size:gap, webhook:WEBHOOK } });
  }
}
return [{ json: { arkRequests:requests, held:heldOut, arkSeniorityUsed:seniority } }];
