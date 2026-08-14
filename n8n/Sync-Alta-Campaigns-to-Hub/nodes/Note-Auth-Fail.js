const sd=$getWorkflowStaticData('global');
sd.altaThreads.skipped.push('AUTH FAILED - re-auth needed via Alta OAuth Callback flow: '+(($input.first().json||{}).detail||''));
return [{ json: { ok:false } }];