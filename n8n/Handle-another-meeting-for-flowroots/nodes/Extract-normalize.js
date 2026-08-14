const p = $json.body.payload;
const attendee = p.attendees[0];

const domain = attendee.email.split('@')[1]?.toLowerCase() || '';

return [{json: {
  domain,
  firstName: attendee.firstName,
  lastName: attendee.lastName,
  email: attendee.email,
  title: p.title || '',
  meetingUrl: p.videoCallData?.url,
  startTime: p.startTime,
  bookingUid: p.uid,
  notes: p.responses?.notes?.value || ''
}}];