const tid = $('Run').first().json['Table ID'];
const resp = $('Check Table').first().json || {};
const tables = resp.tables || [];
const t = tables.find(x => x.id === tid);
if(!t){ throw new Error('Table '+tid+' not found in base appSTTKOc9Afqer9d. Check the Table ID.'); }
const names = (t.fields||[]).map(f => f.name);
const hasEmail = names.includes('Email') || names.includes('public_emails_clean');
if(!hasEmail){ throw new Error('Table "'+t.name+'" has no Email or public_emails_clean field. Aborting before any field creation. Point the Notebook at an L1 contacts or L3 public-emails table.'); }
return [{ json: { table: t.name, hasEmail: true, startedAt: new Date().toISOString() } }];