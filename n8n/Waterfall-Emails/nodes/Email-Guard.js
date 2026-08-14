const tid=$('Params').first().json['Table ID'];
const baseId=$('Params').first().json['Clayroots Base ID'];
const resp=$('Check Table').first().json||{};
const t=(resp.tables||[]).find(x=>x.id===tid);
if(!t){ throw new Error('Table '+tid+' not found in base '+baseId+'.'); }
const names=(t.fields||[]).map(f=>f.name);
if(!(names.includes('Email')||names.includes('public_emails_clean'))){ throw new Error('Table "'+t.name+'" has no Email or public_emails_clean field. Aborting.'); }
return [{ json:{ table:t.name, hasEmail:true, startedAt:new Date().toISOString() } }];