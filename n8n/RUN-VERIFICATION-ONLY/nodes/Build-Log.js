const verdicts=$('Verdict').all().map(i=>i.json);
const start=$('Email Guard').first().json.startedAt;
const startMs=start?new Date(start).getTime():Date.now();
return [{ json:{ 'Automation':'Verification Only', 'Run at': start||new Date().toISOString(), 'Target': $('Run').first().json['Table ID'], 'Records In': $('Read Records').all().length, 'Records Out': verdicts.filter(v=>v.Status==='done').length, 'Errors': verdicts.filter(v=>v.Status==='error').length, 'Duration s': Math.round((Date.now()-startMs)/1000), 'Trigger':'form' } }];