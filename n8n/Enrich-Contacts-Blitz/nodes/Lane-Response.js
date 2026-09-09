// Lane Response: the last node, what the Rootflow receives from this lane: counters only.
const a=$getWorkflowStaticData('global').lane||{};
const covered=Object.keys(a.coveredDomains||{});
return [{ json:{ provider:'Blitz', status:a.skipped?'skipped':((a.called&&a.errors>=a.called&&!a.written)?'error':'ok'), reason:a.skipped||a.firstError||'', chunks:a.chunks, called:a.called, returned:a.returned, kept:a.kept, credits:a.credits, errors:a.errors, built:a.built, updated:a.updated, dupes:a.dupes, fenced:a.fenced, emailsAppended:a.emailsAppended, dnc:a.dnc, written:a.written, writeErrors:a.writeErrors, singleSelectSource:!!a.singleSelectSource, coveredDomains:covered } }];
