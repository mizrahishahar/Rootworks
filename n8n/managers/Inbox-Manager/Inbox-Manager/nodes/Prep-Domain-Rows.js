// One row per domain, only the fields this machine owns. Killed On is never touched. Flagged On keeps the date
// already on the row and is left out when there is none, so a first flag date is never overwritten or cleared.
// The Monday numbers are written only when a full read produced them, so a daily run never blanks them.
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const rows = (sd.cw && sd.cw.domainRows) || [];
if (!rows.length) return [{ json: { _none: true } }];
return rows.map(d => {
  const row = {
    'Domain': d.domain,
    'Client': [String(cw.clientRecId)],
    'Batch': d.batch,
    'Active': !!d.active,
    'Oldest Inbox Days': d.oldestDays,
    'Flags': d.flags,
    'Flag Reason': d.reasons.join('\n'),
    'Last Reviewed': $now.toISO(),
  };
  if (d.warmupMin != null) row['Warmup Min'] = d.warmupMin;
  if (d.flaggedOn) row['Flagged On'] = d.flaggedOn;
  if (typeof d.first500 === 'number') row['First 500 Replies'] = d.first500;
  if (typeof d.latest250 === 'number') row['Latest 250 Replies'] = d.latest250;
  if (typeof d.previous250 === 'number') row['Previous 250 Replies'] = d.previous250;
  return { json: row };
});
