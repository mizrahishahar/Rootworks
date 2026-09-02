const t=$('Resolve Table').first().json;
const names=t.fieldNames||[];
if(!(names.includes('Email')||names.includes('public_emails_clean'))){ throw new Error('Table "'+t.tableName+'" has no Email or public_emails_clean field. Aborting.'); }
return [{ json:{ table:t.tableName, hasEmail:true, startedAt:new Date().toISOString() } }];