const g = $('Rank Field Ready').first().json;
const sd = $getWorkflowStaticData('global');
const rows = Array.isArray(sd.ricRows) ? sd.ricRows : [];
const scanned = rows.length;
const groups = new Map();
let skippedNoDomain = 0;
for (let i = 0; i < rows.length; i++) {
  const t = rows[i];
  if (!t[1]) { skippedNoDomain++; continue; }
  let arr = groups.get(t[1]);
  if (!arr) { arr = []; groups.set(t[1], arr); }
  arr.push(t);
}
const writes = [];
let unchanged = 0, largestDomain = '', largestCount = 0;
const keys = Array.from(groups.keys());
for (let k = 0; k < keys.length; k++) {
  const d = keys[k];
  const list = groups.get(d);
  if (list.length > largestCount) { largestCount = list.length; largestDomain = d; }
  const pos = new Map();
  for (let i = 0; i < list.length; i++) { pos.set(list[i], i); }
  const sorted = list.slice().sort(function (a, b) { return (a[2] - b[2]) || (pos.get(a) - pos.get(b)); });
  for (let i = 0; i < sorted.length; i++) {
    const rank = i + 1;
    if (sorted[i][3] === rank) { unchanged++; continue; }
    writes.push({ id: sorted[i][0], RankInCompany: rank });
  }
}
const stats = { rowsScanned: scanned, companies: groups.size, ranksWritten: writes.length, unchanged: unchanged, skippedNoDomain: skippedNoDomain, largestDomain: largestDomain, largestCount: largestCount, pages: sd.ricPages || 0 };
sd.ricWrites = writes;
sd.ricStats = stats;
delete sd.ricRows;
return [{ json: Object.assign({}, g, stats, { writeCount: writes.length }) }];