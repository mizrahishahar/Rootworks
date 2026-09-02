// Resolve Mirror Row: the client base's Signals mirror row this Hub signal maps to, resolved
// by the synced Record ID BEFORE any paid call (Operator ruling 2026-09-02). No row, no
// relation: refuse here, nothing spent, nothing written. Emits the table facts (Find Companies
// Table) plus the mirror row id Format Companies links to. Reused verbatim from the hiring door.
const cfg=$('Parse Play').first().json;
const t=$('Find Companies Table').first().json;
let mirrorId='';
for(const it of $input.all()){ const j=it.json||{}; if(j.id){ mirrorId=j.id; break; } }
if(!mirrorId) throw new Error('The Signals mirror '+(t.signalsTableName||t.signalsTableId)+' in base '+t.base+' has no row whose Record ID is '+cfg.signal_row+' (Hub signal "'+(cfg.play_name||'')+'"). Sync the Hub Signals view into the client base first. Nothing was spent or written.');
return [{ json: Object.assign({}, t, { mirrorId }) }];
