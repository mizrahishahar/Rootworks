const g = $('Guard Tables').first().json;
const UNCOPYABLE = g.uncopyableTypes || [];
const NOT_CREATABLE = ['multipleRecordLinks', 'externalSyncSource', 'aiText'];
const tgtLower = {};
for (const n of (g.targetFieldNames || [])) { tgtLower[String(n).toLowerCase()] = n; }
const sanitize = function (type, opts) {
  if (!opts) { return null; }
  if (type === 'singleSelect' || type === 'multipleSelects') { const choices = (opts.choices || []).map(function (c) { return c.color ? { name: c.name, color: c.color } : { name: c.name }; }).filter(function (c) { return !!c.name; }); return { choices: choices }; }
  if (type === 'number' || type === 'percent') { return { precision: opts.precision === undefined ? 2 : opts.precision }; }
  if (type === 'currency') { return { precision: opts.precision === undefined ? 2 : opts.precision, symbol: opts.symbol || '$' }; }
  if (type === 'date') { return { dateFormat: opts.dateFormat || { name: 'iso' } }; }
  if (type === 'dateTime') { return { dateFormat: opts.dateFormat || { name: 'iso' }, timeFormat: opts.timeFormat || { name: '24hour' }, timeZone: opts.timeZone || 'utc' }; }
  if (type === 'duration') { return { durationFormat: opts.durationFormat || 'h:mm' }; }
  if (type === 'rating') { return { icon: opts.icon || 'star', max: opts.max || 5, color: opts.color || 'yellowBright' }; }
  if (type === 'checkbox') { return { icon: opts.icon || 'check', color: opts.color || 'greenBright' }; }
  return null;
};
const missingFields = []; const uncopyable = [];
for (const f of (g.sourceFields || [])) {
  if (UNCOPYABLE.indexOf(f.type) >= 0) { uncopyable.push(f.name + ' (' + f.type + ')'); continue; }
  if (tgtLower[String(f.name).toLowerCase()]) { continue; }
  if (NOT_CREATABLE.indexOf(f.type) >= 0) { uncopyable.push(f.name + ' (' + f.type + ', cannot be created)'); continue; }
  const opts = sanitize(f.type, f.options);
  const body = opts ? { name: f.name, type: f.type, options: opts } : { name: f.name, type: f.type };
  missingFields.push({ name: f.name, type: f.type, createBody: body });
}
return [{ json: Object.assign({}, g, { missingFields: missingFields, uncopyable: uncopyable }) }];