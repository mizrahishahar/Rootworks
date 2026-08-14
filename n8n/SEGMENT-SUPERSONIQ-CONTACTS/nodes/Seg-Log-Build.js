const inCount = $('Read CSV').all().length;
const outCount = $('Supersoniq Handler').all().length;
const qn = ($('Supersoniq Upload').first().json['Query name'])||'';
return [{ json:{ 'Automation':'Supersoniq Contacts Upload', 'Run at': $now.toISO(), 'Target': qn, 'Records In': inCount, 'Records Out': outCount, 'Errors': 0, 'Trigger':'form' } }];