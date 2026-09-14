// @@standard:infrastructure
// Every running campaign's senders are set to the client's active inboxes (standards/infrastructure.md,
// Corrected without asking), through Allocate inboxes in PlusVibe by tags, which adds, removes and reads back.
// Left alone, and said so in the report: a client whose inboxes carry language tags, whose campaigns send from
// one language pool each, so one list for every campaign would mix the languages; a client with no active inbox,
// whose campaigns would be left with no sender at all; a dry run. The first two are checked before the dry run so
// a dry run's report says what a live run would really do.
const sd = $getWorkflowStaticData('global');
const live = !!(sd.launch && sd.launch.live);
const calls = [];
for (const r of (sd.results || [])) {
  if (!r.inboxes) continue;
  if (r.twoLanguage) { r.allocation = { skipped: 'two-language client, campaign senders left as they are' }; continue; }
  if (!(r.rollup && r.rollup.activeInboxes > 0)) { r.allocation = { skipped: 'no active inbox, campaign senders left as they are' }; continue; }
  if (!live) { r.allocation = { skipped: 'dry run, campaign senders not checked' }; continue; }
  calls.push({ client: r.client, body: { client: r.client, tag: STANDARD.tags.active } });
}
if (!calls.length) return [{ json: { _none: true } }];
return calls.map(c => ({ json: c }));
