// Split Person Ids: one item per person id the caller asked for. Keep the batch small (the
// caller sends ~40); Alta 429s the person endpoint hard, so the fetch node paces and retries.
const b=($input.first().json||{}).body||{};
const ids=Array.isArray(b.personIds)?b.personIds.map(String).filter(Boolean):[];
if(!ids.length) return [{ json: { _empty:true, personId:'00000000-0000-0000-0000-000000000000' } }];
return ids.map(id=>({ json: { personId:id } }));
