const emails = $('Build Client Vars').first().json.emails || [];
const sharedId = $('Create Shared').first().json.id;
return emails.map(email => ({ json: { email, sharedId } }));