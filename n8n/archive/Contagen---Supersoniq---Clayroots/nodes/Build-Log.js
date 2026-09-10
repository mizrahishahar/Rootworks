const form=$('Waterfall Upload').first().json;
const g=$('Contacts Table Guard').first().json||{};
const cg=$('Format ContaGen').all().length;
const sqNew=$('Format Supersoniq').all().length;
const total=cg+sqNew;
const domains=($('Parse Domains').first().json._domain_count)||0;
let matched=0,delivered=0,credits=0;
for(const i of $('SQ Enrich').all()){const r=i.json||{};matched+=(r.companies_matched||0);delivered+=(r.contacts_delivered||0);credits+=(r.credits_used||0);}
const overlaps=Math.max(0,delivered-sqNew);
const noContact=Math.max(0,domains-matched);
const sd=$getWorkflowStaticData('global');
const sk=sd.wfSkips||{cg:0,sq:0};
const skipped=(Number(sk.cg)||0)+(Number(sk.sq)||0);
const tableName=g.tableName||'';
const tableId=g.tableId||'';
const modeTxt=(g.mode==='append')?'appended to an existing table':'created a new table';
const fc=(g.fieldsCreated&&g.fieldsCreated.length)?g.fieldsCreated.join(', '):'none';
const tag=((form['Tag']||'')+'').trim();
const trig=form._launchRecordId?'record':'form';
const started=form.submittedAt||($('Config').first().json||{}).startedAt;
let dur=0; try{ if(started)dur=Math.max(0,Math.round(($now.toMillis()-new Date(started).getTime())/1000)); }catch(e){}
const errors=g.createdFieldError?1:0;
const fmt=v=>Number(v||0).toLocaleString('en-US');
const parts=[];
parts.push('**'+fmt(total)+' contacts upserted across '+fmt(domains)+' domains**');
parts.push('**Tag:** '+(tag||'none'));
parts.push('**Sources**\n- **ContaGen:** '+fmt(cg)+' contacts\n- **Supersoniq:** '+fmt(sqNew)+' net-new ('+fmt(delivered)+' delivered, '+fmt(overlaps)+' overlapped with ContaGen)');
parts.push('**Domains**\n- **Supersoniq matched:** '+fmt(matched)+'\n- **No contact found:** '+fmt(noContact));
parts.push('**Credits spent:** '+fmt(credits)+'\n**Rows skipped (empty Contact Key):** '+fmt(skipped));
parts.push('**Table:** '+modeTxt+', '+tableName+' ('+tableId+')\n**Fields created:** '+fc);
const warns=[];
if(g.createdFieldError){ warns.push('- '+g.createdFieldError); }
if(g.buildNameIgnored){ warns.push('- Build name ignored: an Existing Table ID was supplied.'); }
if(warns.length){ parts.push('**Warnings ('+warns.length+')**\n'+warns.join('\n')); }
parts.push('**Launched via:** '+trig);
return [{ json: {
  'Automation': 'Contagen -> Supersoniq -> Clayroots',
  'Status': errors?'Succeeded with errors':'Succeeded',
  'Trigger': 'form',
  'Errors': errors,
  'Run at': $now.toISO(),
  'Client': form['Clayroots Base ID'],
  'Target': tableName+' ('+tableId+')',
  'Records In': cg,
  'Records Out': total,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id)
} }];