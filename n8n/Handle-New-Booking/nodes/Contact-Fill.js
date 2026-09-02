// Contact Fill: the three person columns on the booker's Hub contact row, empty-only (ruling 2026-09-02).
// The booking creates its Contact before the verdict, so this runs after Enrich and Qualify Lead and
// plans one update: a value already on the Hub Contacts row (Find Hub Contact, by the booking email) is
// kept as is, never overwritten; an empty column takes the caller's own value (Attribution title), else
// what the client's People table held (base_person), else stays empty. `fill` gates the update node:
// no contact row, or nothing new to write, and Fill Hub Contact is skipped.
let title = ''; try { title = String(($('Attribution').first().json || {}).title || ''); } catch (e) { title = ''; }
let bp = {}; try { bp = $('Enrich and Qualify Lead').first().json.base_person || {}; } catch (e) { bp = {}; }
let ex = null; try { const r = $input.first().json || {}; if (r && r.id) ex = { id: r.id, f: r.fields || r }; } catch (e) { ex = null; }
const s = (v) => String(v == null ? '' : (Array.isArray(v) ? v[0] : v)).trim();
const held = (k) => (ex ? s(ex.f[k]) : '');
const pick = (k, own, base) => { const h = held(k); if (h) return { value: h, source: 'kept' }; const v = s(own) || s(base); return { value: v || null, source: v ? (s(own) ? 'caller' : 'base') : 'none' }; };
const position = pick('position', title, bp.title);
const linkedin = pick('linkedin', '', bp.linkedin_url);
const phone = pick('phone', '', bp.phone);
const sources = { position: position.source, linkedin: linkedin.source, phone: phone.source };
const fill = !!ex && Object.values(sources).some((x) => x === 'caller' || x === 'base');
return [{ json: { contactExists: !!ex, contactId: ex ? ex.id : '', position: position.value, linkedin: linkedin.value, phone: phone.value, sources, fill }, pairedItem: { item: 0 } }];
