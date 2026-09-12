// Resolve Channel: the client's private channel id, whether this run created it or an earlier run
// did. Create Slack Channel is tolerated on name_taken (a rerun after a failure downstream), and a
// private channel cannot be found by name through the invite call (channel_not_found, paid for on
// 2026-09-06 execution 13869), so the id is taken from the create answer when there is one and
// otherwise picked by exact name out of conversations.list, which Marvin's token lists for every
// channel it is a member of. Empty when neither knows it: the invite then fails and the run row
// names it, the run itself carries on.
const v = $('Build Client Vars').first().json || {};
let id = ''; let created = false;
try { id = $('Create Slack Channel').first().json.id || ''; created = !!id; } catch (e) {}
let createError = '';
if (!id) {
  try { createError = String($('Create Slack Channel').first().json.error || ''); } catch (e) {}
  const list = ($input.first().json || {}).channels || [];
  const hit = list.find((c) => c && c.name === v.channelName);
  id = hit ? hit.id : '';
}
return [{ json: { channelId: id, channelName: v.channelName, created, createError } }];
