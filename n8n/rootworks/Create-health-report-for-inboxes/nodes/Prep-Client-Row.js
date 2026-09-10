const b = $('Compute').first().json._b;
const r = b.rollup;
return [{
  json: {
    id: b.clientRecId,
    'Active Mailboxes': r.activeMailboxes,
    'Active Capacity': r.activeCapacity,
    'Not Active Mailboxes': r.notActiveMailboxes,
    'Not Active Capacity': r.notActiveCapacity,
    // A percent field stores the fraction; 0.5 renders as 50%.
    'Reserve Ratio': r.reserveRatio,
    'Last Inbox Review': $now.toISO(),
  },
}];
