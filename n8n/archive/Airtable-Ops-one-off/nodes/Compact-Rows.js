// Compact Rows: the list-records door's response. One object: { count, rows:[{id,...fields}] }.
const rows=[];
for(const it of $input.all()){
  const j=it.json||{};
  if(!j.id) continue;
  rows.push(Object.assign({ id:j.id }, j.fields||j));
}
return [{ json: { count:rows.length, rows } }];
