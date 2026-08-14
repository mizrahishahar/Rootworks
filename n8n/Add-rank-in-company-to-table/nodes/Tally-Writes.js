const items = $input.all();
let fails = 0;
for (let i = 0; i < items.length; i++) {
  const j = items[i].json || {};
  if (!j.id || j.error) { fails++; }
}
return [{ json: { writeFailures: fails, attempted: items.length } }];