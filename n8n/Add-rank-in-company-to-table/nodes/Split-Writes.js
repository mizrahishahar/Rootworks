const sd = $getWorkflowStaticData('global');
const w = Array.isArray(sd.ricWrites) ? sd.ricWrites : [];
delete sd.ricWrites;
return w.map(function (x) { return { json: x }; });