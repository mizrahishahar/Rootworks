const j=$input.first().json||{};
const arr=j.data||j.emails||[];
return [{ json: { total: arr.length, leads: [...new Set(arr.map(m=>m.lead))].slice(0,10), sample: arr.slice(0,3).map(m=>({lead:m.lead, dir:m.direction, subj:(m.subject||'').slice(0,60), ts:m.timestamp_created})) } }];