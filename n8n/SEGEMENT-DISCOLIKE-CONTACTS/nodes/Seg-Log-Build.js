const inCount = $('Read CSV').all().length;
const outCount = $('Contacts Handler').all().length;
const qn = ($('Contacts Upload').first().json['Query name'])||'';
return [{ json:{ 'Automation':'Contacts Upload', 'Run at': $now.toISO(), 'Target': qn, 'Records In': inCount, 'Records Out': outCount, 'Errors': 0, 'Trigger':'form' } }];