// One accumulator entry per client, read back by the Slack post and the run log.
const sd = $getWorkflowStaticData('global');
if (!Array.isArray(sd.results)) sd.results = [];
const cw = $('Loop Over Clients').first().json;
let b = null;
try { b = $('Compute').first().json._b; } catch (e) {}

let inboxWrites = 0;
try { inboxWrites = $('Upsert Inbox Drift').all().length; } catch (e) {}
let domainWrites = 0;
try { domainWrites = $('Upsert Domains').all().length; } catch (e) {}
let gwApplied = [];
try { gwApplied = $('Bulk Assign Tags').all().map(i => i && i.json); } catch (e) {}
let gwOps = [];
try { gwOps = $('Prep Gateway Ops').all().map(i => i.json).filter(o => !o._noop); } catch (e) {}

const failed = [];
if (b && b.statFailures) failed.push(b.statFailures + ' stat call(s) failed');
if (b && !b.controlsOk) failed.push('SURBL controls failed');
if (b && b.inboxes > 0 && inboxWrites === 0) failed.push('inbox drift write returned nothing');
if (b && b.domains.length > 0 && domainWrites === 0) failed.push('domain write returned nothing');
gwOps.forEach((o, i) => {
  const r = gwApplied[i] || {};
  const st = r.statusCode;
  const ok = st === undefined ? false : (st >= 200 && st < 300);
  if (!ok) failed.push('gateway ' + o.action + ' of ' + o.count + ' inbox(es) failed');
});

sd.results.push({
  client: cw.clientName,
  isPool: !!cw.isPool,
  slackChannel: String(cw.slackChannel || ''),
  inboxes: b ? b.inboxes : 0,
  domains: b ? b.domains.length : 0,
  flagged: b ? b.domains.filter(d => d.flags.length).length : 0,
  assigned: b && b.controlsOk ? b.assign.length : 0,
  unassigned: b && b.controlsOk ? b.unassign.length : 0,
  surblNote: b ? b.surblNote : '',
  block: b ? b.block : '',
  failed,
});
return [{ json: { done: true } }];
