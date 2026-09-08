// Batch Response: the last node, so its output is what Execute Workflow hands back to the parent:
// the counters (Batch Summary), never rows. It runs after Log Batch, so this pass's Hub row exists
// before the parent hears back and the parent's close reads it by prefix.
return [{ json: $('Batch Summary').first().json }];
