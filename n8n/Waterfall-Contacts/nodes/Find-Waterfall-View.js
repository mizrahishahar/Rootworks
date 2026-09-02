// Find Waterfall View: after every lane group closes, read the base meta again. The email door is
// fired only when the People table carries a view named exactly "Not Waterfalled" (the register's
// view: relevance = 1 and Status empty); otherwise the hand-over is a skip in the log. Nothing else
// (ruled 2026-09-02). No Fire Waterfall field exists on the launch row.
const cfg=$('Find Tables').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:[];
const t=tables.find(x=>x.id===cfg.peopleTableId)||null;
const VIEW='Not Waterfalled';
const v=t?((t.views||[]).find(x=>String(x.name||'').trim()===VIEW)):null;
return [{ json: { hasView: !!v, viewName: VIEW, viewId: v?v.id:'', metaOk: tables.length>0 } }];
