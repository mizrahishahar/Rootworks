// FE Prep: decides whether FullEnrich is asked for this lead, and builds the one-contact submission.
// A direct number already in hand (the row's own phone, or the reply signature) ends the search for
// free. A toll-free signature does not: FullEnrich is still asked for a direct line, and the
// switchboard stays the fallback. Asked by LinkedIn URL when the row holds one, else by first name +
// last name + domain; a lead with neither cannot be asked and the skip is named in the answer.
const j = Object.assign({}, $input.first().json || {});
const acc = j.acc || { phone: '', source: 'none', tf: '', tf_source: '', tried: [], skipped: [], failed: [] };
j.acc = acc;
j._call = false;
if (j._invalid || acc.phone) return [{ json: j }];
const p = j.person || {};
const cut = (v) => String(v || '').slice(0, 100);
if (!(p.linkedin || (p.first_name && p.last_name && p.domain))) {
  acc.skipped.push('FullEnrich: cannot be asked (no LinkedIn URL and no first name + last name + domain)');
  return [{ json: j }];
}
const c = { enrich_fields: ['contact.phones'], custom: { row_id: String(j.recordId) } };
if (p.first_name && p.last_name) { c.first_name = cut(p.first_name); c.last_name = cut(p.last_name); }
if (p.domain) c.domain = cut(p.domain);
if (p.linkedin) c.linkedin_url = p.linkedin;
j._call = true;
j.body = { name: 'Find Lead Phone ' + String(j.recordId), data: [c] };
acc.tried.push('FullEnrich');
return [{ json: j }];
