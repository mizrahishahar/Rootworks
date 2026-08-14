const cfg = $('Init Backfill').first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.ackState;
const items = $input.all().map(function (i) { return i.json || {}; });
const cameFromWrite = !(items.length === 1 && items[0]._noop === true);
if (cameFromWrite) {
  let failed = 0;
  for (const it of items) { if (it && it.error) { failed++; } }
  st.writeFailures += failed;
  st.keysWritten += Math.max(0, items.length - failed);
}
st.pages++;
const page = $('AT Fetch Page').first().json || {};
const nextOffset = String(page.offset == null ? '' : page.offset);
const capped = !!nextOffset && st.pages >= 1000;
const done = !nextOffset || st.pages >= 1000;
const q = { pageSize: 100, 'fields[]': cfg.fetchFields };
if (nextOffset) { q.offset = nextOffset; }
return [{ json: { done: done, capped: capped, pages: st.pages, rowsScanned: st.rowsScanned, keysWritten: st.keysWritten, query: q } }];