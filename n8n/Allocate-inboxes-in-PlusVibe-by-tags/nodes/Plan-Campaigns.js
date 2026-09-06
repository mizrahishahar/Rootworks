// Resolve the tag, its member inboxes, and the campaigns that wear it.
// The plan rides on every emitted item; nothing here uses workflow static data, so two
// concurrent tool calls on different clients cannot race each other.
const ctx = $('Resolve Workspace').first().json;
const wanted = String(ctx.tag || '').toLowerCase();

let tagItems = [];
try { tagItems = $('List Tags').all().map(i => i && i.json).filter(Boolean); } catch (e) {}
const tags = [];
for (const t of tagItems) {
  if (Array.isArray(t)) tags.push(...t);
  else if (Array.isArray(t.tags)) tags.push(...t.tags);
  else if (t && t._id) tags.push(t);
}
const tagRow = tags.find(t => String(t.name || '').toLowerCase() === wanted);
const tagId = tagRow ? String(tagRow._id) : '';

let pages = [];
try { pages = $('List Accounts').all().map(i => i && i.json).filter(Boolean); } catch (e) {}
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }
const lower = (s) => String(s || '').toLowerCase();
const tagged = tagId ? accounts.filter(a => Array.isArray((a.payload || {}).tags) && a.payload.tags.map(String).includes(tagId)) : [];
// The API refuses campaign edits on an account in ERROR, so it is never offered as an add.
const uniq = (a) => [...new Set(a)];
const skipped = uniq(tagged.filter(a => String(a.status || '') === 'ERROR').map(a => a.email));
const members = uniq(tagged.filter(a => String(a.status || '') !== 'ERROR').map(a => lower(a.email)));
const taggedAll = uniq(tagged.map(a => lower(a.email)));

let cpages = [];
try { cpages = $('List Campaigns').all().map(i => i && i.json).filter(Boolean); } catch (e) {}
const camps = [];
for (const p of cpages) {
  if (Array.isArray(p)) camps.push(...p);
  else if (Array.isArray(p.campaigns)) camps.push(...p.campaigns);
  else if (p && (p.id || p._id)) camps.push(p);
}
const LIVE = ['ACTIVE', 'PAUSED', 'DRAFT'];
const seenCamp = new Set();
const live = camps.filter(c => {
  if (!LIVE.includes(String(c.status || '').toUpperCase())) return false;
  const id = String(c.id || c._id);
  if (seenCamp.has(id)) return false;
  seenCamp.add(id);
  return true;
});

// A campaign can carry tags of its own; when it does, that is the selection. PlusVibe leaves
// this array empty in every Flowroots workspace measured so far, so the fallbacks below are
// what actually fires, and the mode is reported back so the caller knows which one ran.
const byTag = tagId ? live.filter(c => Array.isArray(c.tags) && c.tags.map(String).includes(tagId)) : [];
let selected = byTag;
let mode = 'campaigns labelled with the tag';
if (!byTag.length) {
  if (wanted === 'gateway') {
    selected = live.filter(c => / - Gateway$/i.test(String(c.camp_name || '')));
    mode = 'no campaign carries the tag, so: non-completed campaigns whose name ends " - Gateway"';
  } else if (wanted === 'active') {
    selected = live.filter(c => String(c.status || '').toUpperCase() === 'ACTIVE');
    mode = 'no campaign carries the tag, so: every ACTIVE campaign';
  } else {
    selected = [];
    mode = 'no campaign carries the tag and this tag has no name-based fallback';
  }
}

const plan = {
  workspaceId: ctx.workspaceId,
  client: ctx.client,
  tag: ctx.tag,
  tagId,
  tagFound: !!tagId,
  members,
  taggedAll,
  skipped,
  mode,
  accountsSeen: accounts.length,
  campaigns: selected.map(c => ({ id: String(c.id || c._id), name: String(c.camp_name || ''), status: String(c.status || '') })),
};

const base = 'https://api.plusvibe.ai/api/v1/campaign/get/accounts?workspace_id=' + ctx.workspaceId + '&campaign_id=';
if (!plan.campaigns.length) return [{ json: { _empty: true, _plan: plan } }];
return plan.campaigns.map(c => ({ json: { campaign_id: c.id, name: c.name, status: c.status, url: base + c.id, _plan: plan } }));
