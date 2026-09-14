const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const r = sd.cw.clientRow;
return [{
  json: {
    id: String(cw.clientRecId),
    'Active Mailboxes': r.activeInboxes,
    'Active Capacity': r.activeCapacity,
    'Not Active Mailboxes': r.notActiveInboxes,
    'Not Active Capacity': r.notActiveCapacity,
    // A percent field stores the fraction; 0.5 renders as 50%. No active capacity has no ratio: 0.
    'Reserve Ratio': r.reserveRatio == null ? 0 : r.reserveRatio,
    'Last Inbox Review': $now.toISO(),
  },
}];
