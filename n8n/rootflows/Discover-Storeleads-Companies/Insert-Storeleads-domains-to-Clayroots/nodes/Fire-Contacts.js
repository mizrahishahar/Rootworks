// Fire Contacts: one item in Enrich Contacts' event shape (its Event Row reads launch-row keys), so
// the companies just landed get their people at once. Client, Table Companies, View Not Sourced,
// Tag, and Domains = exactly the domains this run landed, so on a base with a backlog the contacts
// pull is scoped to this pull and never re-sweeps the whole view (ruled 2026-09-09). Enrich Contacts
// writes its own launch row; nothing else is passed. Past the loop's scope cap the domain list was
// not kept in full, so Domains goes empty and the whole view is worked (Build Log says so).
const p=$('Launch Params').first().json;
const st=($getWorkflowStaticData('global').slBatchState)||{};
const domains=st.scopeOverflow?[]:Array.from(new Set((st.landedDomains||[]).map(d=>String(d||'').trim().toLowerCase()).filter(Boolean)));
return [{ json:{ Client:[p.clientRecId], Table:'Companies', View:'Not Sourced', Tag:p.tag||'', Domains:domains } }];
