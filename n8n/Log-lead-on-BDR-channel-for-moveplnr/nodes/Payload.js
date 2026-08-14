const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const b=$input.first().json.body||{};
return [{ json: b }];