const form=$('Waterfall Storeleads').first().json;
const started=$('Config').first().json.startedAt;
const G=(n)=>{ try{ return $(n).all(); }catch(e){ return []; } };
const comps=$('Collect Domains').first().json._companies||[];
const stores=$('Collect Domains').first().json._domain_count||comps.length;
let companiesOut=0; try{ companiesOut=$('Lane A Summary').first().json.companiesWithEmails||0; }catch(e){ companiesOut=G('Format Companies').length; }
const contacts=G('Read Final').filter(i=>i && i.json && i.json.id).length;
let providers=[]; try{ providers=Array.from(new Set($('Build SL Query').all().map(i=>i.json._provider))); }catch(e){}
let cc=''; try{ const l=$('Build SL Query').first().json._ccList||[]; cc=l.length?l.join('/'):'ALL'; }catch(e){}
let sqErrors=0,matched=0,delivered=0,credits=0;
for(const i of G('SQ Enrich')){ const r=i.json||{}; if(!r||!Array.isArray(r.results)) sqErrors++; matched+=(r.companies_matched||0); delivered+=(r.contacts_delivered||0); credits+=(r.credits_used||0); }
const withTP=comps.filter(c=>c['Trustpilot Rating']!=null).length;
const withMig=comps.filter(c=>c['Migrated From']).length;
const build=form['Build name']||'';
const dateStr=$now.toFormat('yyyy-MM-dd');
const domainsTable=build+' - Domains - '+dateStr;
const contactsTable=build+' - Contacts - '+dateStr;
const platLabel=providers.length?providers.join(', '):'all';
const dur=Math.round((Date.now()-new Date(started).getTime())/1000);
const trig=form._launchRecordId?'record':'form';
const desc=[
 '• Stores pulled: '+stores+' ('+platLabel+', '+cc+')',
 '• Domains table (public emails): '+companiesOut+' -> '+domainsTable,
 '• Contacts table: '+contacts+' -> '+contactsTable+' (SQ matched '+matched+', delivered '+delivered+', credits '+credits+')',
 '• Trustpilot on '+withTP+' | platform-migrated '+withMig,
 '• Launched via '+trig+(sqErrors?' | SQ errors: '+sqErrors:'')
].join('\n');
return [{ json:{
  'Automation': 'Waterfall: Storeleads -> Supersoniq',
  'Status': 'Succeeded',
  'Run at': $now.toISO(),
  'Client': form['Clayroots Base ID'],
  'Target': domainsTable+' + '+contactsTable,
  'Records In': stores,
  'Records Out': companiesOut + contacts,
  'Duration s': dur,
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id),
  'Description': desc
}}];