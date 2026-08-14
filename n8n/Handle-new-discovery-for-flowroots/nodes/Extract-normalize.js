const p = $json.body.payload;
const attendee = p.attendees[0];

const rawWebsite = p.responses?.website?.value || '';
const domain = rawWebsite
  .replace(/https?:\/\//,'')
  .replace(/^www\./,'')
  .split('/')[0]
  .toLowerCase();

return [{json: {
  domain,
  website: rawWebsite,
  firstName: attendee.firstName,
  lastName: attendee.lastName,
  email: attendee.email,
  phone: attendee.phoneNumber || '',
  title: p.title || '',
  meetingUrl: p.videoCallData?.url,
  startTime: p.startTime,
  bookingUid: p.uid,
  notes: p.responses?.notes?.value || ''
}}];