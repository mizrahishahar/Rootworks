// Find Waterfall View: after the People upsert, read the base meta again. The email door is
// fired only when the People table carries a view named exactly "Relevant & Not Waterfalled";
// otherwise the hand-over is a skip in the log. Nothing else (ruled 2026-09-02).
const cfg=$('Find Tables').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:[];
const t=tables.find(x=>x.id===cfg.peopleTableId)||null;
const VIEW='Relevant & Not Waterfalled';
const v=t?((t.views||[]).find(x=>String(x.name||'').trim()===VIEW)):null;
return [{ json: { hasView: !!v, viewName: VIEW, viewId: v?v.id:'', metaOk: tables.length>0 } }];
