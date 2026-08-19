const form = $('Contacts Launch').first().json;
const g = $('Contacts Table Guard').first().json || {};
const dg = $('Domains Table Guard').first().json || {};
const written = $('Format AI-Ark').all().length;
const domains = ($('Parse Rows').first().json._domain_count)||0;
const sd = $getWorkflowStaticData('global');
const skipped = Number(sd.aiArkSkipped)||0;
const matched = Number(sd.aiArkMatched)||0;
const tableName = g.tableName||''; const tableId = g.tableId||'';
const modeTxt = (g.mode==='append')?'appended to an existing table':'created a new table';
const fc = (g.fieldsCreated&&g.fieldsCreated.length)?g.fieldsCreated.join(', '):'none';
const tag = ((form['Tag']||'')+'').trim();
const trig = form._launchRecordId?'record':'form';
const started = form.submittedAt||($('Config').first().json||{}).startedAt;
let dur=0; try{ if(started) dur=Math.max(0,Math.round(($now.toMillis()-new Date(started).getTime())/1000)); }catch(e){}
const fmt = v=>Number(v||0).toLocaleString('en-US');
const parts=[];
parts.push('**'+fmt(written)+' AI-Ark contacts upserted across '+fmt(domains)+' domains**');
parts.push('**Tag:** '+(tag||'none'));
parts.push('**Domains table:** '+(dg.domainsTableName||'')+' ('+(dg.domainsTableId||'')+')\n- **Company data matched:** '+fmt(matched)+'\n- **Fell back to name-only:** '+fmt(Math.max(0,domains-matched)));
parts.push('**Rows skipped (empty Contact Key):** '+fmt(skipped));
parts.push('**Table:** '+modeTxt+', '+tableName+' ('+tableId+')\n**Fields created:** '+fc);
if (g.buildNameIgnored) { parts.push('**Warnings (1)**\n- Build name ignored: an Existing Table ID was supplied.'); }
parts.push('**Launched via:** '+trig);
return [{ json: {
  'Automation': 'AI-Ark Export -> Clayroots',
  'Status': 'Succeeded',
  'Trigger': 'form',
  'Errors': 0,
  'Run at': $now.toISO(),
  'Client': form['Clayroots Base ID'],
  'Target': tableName+' ('+tableId+')',
  'Records In': written+skipped,
  'Records Out': written,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id)
} }];