// Wake infra, step 2 of 2: decide whether THIS execution still owns the wake.
// Fed by Reread Prospect, a fresh read of the prospect row taken after the 3 minute Quiet Wait. If a later
// reply landed on the same row during the wait, that later execution's own write moved Last Engaged past
// what this run knows about; that later execution will do the wake, so this one ends here with no wake
// (return no items). Otherwise this run is still the latest and builds the reason for Wake Operator.
const row = $input.first().json || {};
const fields = row.fields || row;

const myReplyTime = String($('Alta Normalize').first().json.first_engagement || '');
const rowLastEngaged = String(fields['Last Engaged'] || '');

const myT = Date.parse(myReplyTime);
const rowT = Date.parse(rowLastEngaged);
if (rowLastEngaged && !isNaN(rowT) && !isNaN(myT) && rowT > myT) {
  // A newer reply arrived during the quiet wait; that execution owns the wake.
  return [];
}

// Is this the row's first reply (new lead this run) or a repeat visitor (follow-up path)?
let isFirstReply = false;
try { isFirstReply = !!$('Create CRM Prospect').first().json.id; } catch (e) { isFirstReply = false; }

const channel = $('Alta Normalize').first().json.source_channel === 'LinkedIn' ? 'LinkedIn' : 'email';
const outreachStatus = String(fields['OutreachStatus'] || '').trim();

let owed = 'A response is owed.';
if (outreachStatus === 'Disqualified') owed = 'A closing response is owed.';
else if (isFirstReply) owed = 'The first response is owed.';

const who = isFirstReply ? 'First reply' : 'He wrote again';
const reason = who + ' on ' + channel + '. ' + (outreachStatus || 'unknown status') + '. ' + owed;

return [{ json: {
  recordId: row.id || fields.id || '',
  reason,
  source_channel: $('Alta Normalize').first().json.source_channel || ''
} }];
