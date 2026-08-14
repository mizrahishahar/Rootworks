const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.slackSyncResults=[];
return $input.all();