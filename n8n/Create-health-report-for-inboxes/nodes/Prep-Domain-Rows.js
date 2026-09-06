// One row per domain. Only the fields this machine owns are written; Killed On is never touched,
// and Flagged On carries the value already on the row so a first flag date is never overwritten.
const b = $('Compute').first().json._b;
if (!b.domains.length) return [{ json: { _none: true } }];
return b.domains.map(d => {
  const row = {
    'Domain': d.domain,
    'Client': [b.clientRecId],
    'Batch': d.batch,
    'Active': !!d.active,
    'Warmup Min': d.warmupMin == null ? null : d.warmupMin,
    'Oldest Inbox Days': d.oldestDays,
    'SURBL': d.surbl,
    'Flags': d.flags,
    'Flag Reason': d.reasons.join('\n'),
    'Flagged On': d.flaggedOn,
    'Last Reviewed': $now.toISO(),
  };
  // Empty until the domain has actually taken 500 sends: a number there would be a lie.
  row['First 500 Replies'] = d.first500 ? d.first500.human : null;
  row['Last 500 Replies'] = d.last500 ? d.last500.human : null;
  return { json: row };
});
