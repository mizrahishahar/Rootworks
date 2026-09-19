// FU Contact Plan: the follow-up exit's contact write (ruling 2026-09-19). A reply from a company that
// already has a Prospects row never makes a second row and is never re-qualified; the person behind it
// still belongs on the row, so this plans one Contacts upsert keyed on email.
// Two rules:
//   Company is APPENDED, never replaced. A contact already linked to another company keeps it and gains
//   this one, so nobody is moved off their row by a reply.
//   Person columns are empty-only, the same rule Contact Fill uses: a value already on the Hub contact
//   is kept, an empty one takes what the Alta payload carries.
// No email means no upsert: the match key is email, and a blank one would collide with every other
// contact that has none. Returning no items leaves the Airtable node unexecuted, and the run log says so.
const n = $('Alta Normalize').first().json || {};
const email = String(n.lead_email || '').trim().toLowerCase();
if (!email) return [];

let ex = null;
try { const r = $input.first().json || {}; if (r && r.id) ex = { id: r.id, f: r.fields || r }; } catch (e) { ex = null; }
const s = (v) => String(v == null ? '' : (Array.isArray(v) ? v[0] : v)).trim();
const held = (k) => (ex ? s(ex.f[k]) : '');
const keepOrTake = (k, own) => held(k) || s(own) || null;

// The company row this reply landed on: the existing prospect the branch matched.
let rowId = '';
try { rowId = $('Find CRM Prospect').first().json.id || ''; } catch (e) {}
const links = [];
if (ex) { const c = ex.f.Company || []; for (const x of (Array.isArray(c) ? c : [])) { const id = typeof x === 'string' ? x : ((x && x.id) || ''); if (id) links.push(id); } }
const already = rowId ? links.indexOf(rowId) >= 0 : true;
if (rowId && !already) links.push(rowId);

return [{ json: {
  firstName: keepOrTake('firstName', n.first_name) || email,
  lastName: keepOrTake('lastName', n.last_name),
  position: keepOrTake('position', n.job_title),
  linkedin: keepOrTake('linkedin', n.linkedin_url),
  email,
  Company: links,
  _contactExisted: !!ex,
  _linkedNow: !!(rowId && !already),
  _rowId: rowId,
} }];
