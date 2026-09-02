const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
return [{ json: { received_at: new Date().toISOString(), headers: j.headers||{}, query: j.query||{}, body: j.body||{} } }];