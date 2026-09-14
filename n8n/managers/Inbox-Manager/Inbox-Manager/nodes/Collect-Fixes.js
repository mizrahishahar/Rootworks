// What each correction call returned, one entry per call, paired with the plan in order (the call node runs one
// item at a time). A success status is not proof: Decide measures every correction from the read-back.
const sd = $getWorkflowStaticData('global');
const plan = $('Plan Fixes').all().map(i => i.json);
const res = $input.all().map(i => (i && i.json) || {});
sd.cw.fixes = plan.map((c, i) => {
  const r = res[i] || {};
  const st = r.statusCode;
  const body = r.body;
  const bodyError = body && typeof body === 'object' && (body.status === 'error' || body.success === false);
  const ok = st !== undefined && st >= 200 && st < 300 && !bodyError && !r.error;
  const why = ok ? '' : String((body && (body.message || body.error)) || (r.error && (r.error.message || r.error)) || 'no response').slice(0, 200);
  return { kind: c.kind, ids: (c.body && c.body.ids) || [], ok, status: st === undefined ? null : st, error: why };
});
return [{ json: { calls: sd.cw.fixes.length, failed: sd.cw.fixes.filter(f => !f.ok).length } }];
