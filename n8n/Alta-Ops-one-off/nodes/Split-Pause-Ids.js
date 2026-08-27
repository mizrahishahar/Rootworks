// Split Pause Ids: one item per prospect to pause (or resume). Body:
// { prospectIds:[...], action?: 'pause'|'resume' }. The caller keeps batches small; the pause
// node paces and retries because Alta 429s hard.
const b=($input.first().json||{}).body||{};
const action=String(b.action||'pause').toLowerCase()==='resume'?'resume':'pause';
const ids=Array.isArray(b.prospectIds)?b.prospectIds.map(String).filter(Boolean):[];
if(!ids.length) return [{ json: { _empty:true, prospectId:'00000000-0000-0000-0000-000000000000', action } }];
return ids.map(id=>({ json: { prospectId:id, action } }));
