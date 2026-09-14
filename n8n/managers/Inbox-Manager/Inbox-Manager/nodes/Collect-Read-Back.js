// The fleet as it stands after the corrections, read a minute later: a reconnect can flip to connected and fall
// back when the inbox provider side is not live, so the read waits before it counts.
const sd = $getWorkflowStaticData('global');
const pages = $input.all().map(i => i && i.json).filter(Boolean);
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }
sd.cw.readback = accounts.length ? accounts : null;
return [{ json: { readBack: accounts.length } }];
