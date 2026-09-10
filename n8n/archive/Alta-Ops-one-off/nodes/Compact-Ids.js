// Compact Ids: every prospect of one campaign, ids only. n8n's own cursor pagination handles the
// paging here (hand-rolled cursor paging stalled after 4 pages); person records are fetched
// separately through the persons door, because a person lookup each blows the webhook timeout.
const rows=[];
for(const it of $input.all()){
  const b=it.json||{};
  const list=b.data||b.prospects||b.items||b.results||(Array.isArray(b)?b:[]);
  for(const p of (Array.isArray(list)?list:[])){
    if(!p||!p.id) continue;
    rows.push({ prospectId:p.id, personId:p.personId||'', status:p.status||'', sequenceStatus:p.sequenceStatus||'', createdAt:p.createdAt||'' });
  }
}
return [{ json: { count:rows.length, rows } }];
