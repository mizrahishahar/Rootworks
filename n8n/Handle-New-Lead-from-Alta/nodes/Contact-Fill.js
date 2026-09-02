// Contact Fill: the three person columns the Hub contact upsert writes, empty-only (ruling 2026-09-02).
// A value already on the Hub Contacts row (Find Hub Contact, by email) is kept as is, never overwritten;
// an empty column takes the caller's own value (Alta Normalize, then the Alta person read), else what the
// client's People table held (base_person from Enrich and Qualify Lead), else stays empty.
// Create CRM Contact reads this item.
const n = $('Alta Normalize').first().json || {};
let mp = {}; try { mp = $('Merge Person').first().json || {}; } catch (e) { mp = {}; }
let bp = {}; try { bp = $('Enrich and Qualify Lead').first().json.base_person || {}; } catch (e) { bp = {}; }
let ex = null; try { const r = $input.first().json || {}; if (r && r.id) ex = { id: r.id, f: r.fields || r }; } catch (e) { ex = null; }
const s = (v) => String(v == null ? '' : (Array.isArray(v) ? v[0] : v)).trim();
const held = (k) => (ex ? s(ex.f[k]) : '');
const pick = (k, own, base) => { const h = held(k); if (h) return { value: h, source: 'kept' }; const v = s(own) || s(base); return { value: v || null, source: v ? (s(own) ? 'caller' : 'base') : 'none' }; };
const position = pick('position', s(n.job_title) || s(mp.title), bp.title);
const linkedin = pick('linkedin', n.linkedin_url, bp.linkedin_url);
const phone = pick('phone', '', bp.phone);
const sources = { position: position.source, linkedin: linkedin.source, phone: phone.source };
const fill = Object.values(sources).some((x) => x === 'caller' || x === 'base');
return [{ json: { contactExists: !!ex, contactId: ex ? ex.id : '', position: position.value, linkedin: linkedin.value, phone: phone.value, sources, fill }, pairedItem: { item: 0 } }];
