const sd = $getWorkflowStaticData('global');
const items = $input.all();
let fails = 0;
for (let i = 0; i < items.length; i++) {
  const j = items[i].json || {};
  if (j.error !== undefined && j.error !== null && j.error !== '') { fails++; }
}
sd.bd_writeFail = (sd.bd_writeFail || 0) + fails;
const rp = $('Resolve Page').first().json;
const page = Number(rp.page) || 0;
const offset = String(rp.offset || '');
const capped = page >= 1000 && !!offset;
if (capped) { sd.bd_capped = true; }
return [{ json: { baseUrl: rp.baseUrl, offset: offset, page: page, done: !offset || page >= 1000 } }];