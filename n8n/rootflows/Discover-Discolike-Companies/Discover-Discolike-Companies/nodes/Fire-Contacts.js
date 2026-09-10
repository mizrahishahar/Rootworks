// Fire Contacts: one item in Enrich Contacts' event shape (its Event Row reads launch-row keys),
// so the companies just landed get their people at once. Client, Table Companies, View Not Sourced,
// Tag, and Domains = exactly the domains this run landed, so on a base with a backlog the contacts
// pull is scoped to this pull and never re-sweeps the whole view (ruled 2026-09-09). Enrich
// Contacts writes its own launch row; nothing else is passed.
const p=$('Launch Params').first().json;
let domains=[];
try{ domains=$('Format Companies').all().map(i=>String((i.json||{}).Domain||'').trim().toLowerCase()).filter(Boolean); }catch(e){}
return [{ json:{ Client:[p.clientRecId], Table:'Companies', View:'Not Sourced', Tag:p.tag||'', Domains:Array.from(new Set(domains)) } }];
