// One line per field: HTTP status and the created field name, or Airtable's error message.
const out=[];
for(const it of $input.all()){ const j=it.json||{}; const b=j.body||{}; out.push({ status:j.statusCode, name:b.name||(b.error&&(b.error.message||b.error.type))||JSON.stringify(b).slice(0,120) }); }
return [{ json:{ results:out } }];
