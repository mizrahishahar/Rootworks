// Normalizes Find Meeting's single search result: the Airtable search node can hand back fields nested
// under .fields or flattened at the top level depending on version, so read defensively (same pattern as
// Resolve-Client.js / Resolve-Prospect.js). Company is the Meetings row's link to the Prospects row.
let m=null; try{ m=$input.first().json; }catch(e){}
const f=(m&&(m.fields||m))||{};
const meetingId=(m&&m.id)||'';
const company=Array.isArray(f['Company'])?f['Company']:[];
const prospectId=company[0]||'';
return [{ json:{ meetingId, prospectId, found: !!(meetingId&&prospectId) } }];
