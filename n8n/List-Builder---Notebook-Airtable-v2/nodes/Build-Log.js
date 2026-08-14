const verdicts = $('Verdict').all().map(i => i.json);
const start = $('Email Guard').first().json.startedAt;
const startMs = start ? new Date(start).getTime() : Date.now();
const recordsIn = $('Read Records').all().length;
const recordsOut = verdicts.filter(v => v.Status === 'done').length;
const errors = verdicts.filter(v => v.Status === 'error').length;
return [{ json: {
  'Automation': 'Notebook',
  'Run at': start || new Date().toISOString(),
  'Target': $('Run').first().json['Table ID'],
  'Records In': recordsIn,
  'Records Out': recordsOut,
  'Errors': errors,
  'Duration s': Math.round((Date.now() - startMs) / 1000),
  'Trigger': 'form'
} }];