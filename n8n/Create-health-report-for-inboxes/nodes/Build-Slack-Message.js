// One message for the whole estate, one block per client, the pool last.
const sd = $getWorkflowStaticData('global');
const results = (sd.results || []).filter(r => r.block);
const ordered = results.filter(r => !r.isPool).concat(results.filter(r => r.isPool));
const text = ordered.map(r => r.block).join('\n\n\n');
return [{ json: { channel: 'C0B8YFC5R0C', text: text || 'No PlusVibe client had any inbox to report on.' } }];
