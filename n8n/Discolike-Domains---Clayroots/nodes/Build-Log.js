const form=$('Companies Upload').first().json;
const inCount=$('Read CSV').all().length;
const handled=$('Companies Handler').all();
const total=handled.length;
const hasPublic=handled.filter(i=>i.json.segment==='has_public').length;
const noPublic=handled.filter(i=>i.json.segment==='no_public').length;
let upserted=0; try{ upserted=$('AT Emit Companies').all().length; }catch(e){}
const skipped=Math.max(0, total-upserted);
let clientRec=[];
try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) clientRec=[rc.id]; }catch(e){}
const g=$('AT Table Guard').first().json||{};
const tableName=g.tableName||'';
const tableId=g.tableId||'';
const modeTxt=(g.mode==='append')?'appended to an existing table':'created a new table';
const fc=(g.fieldsCreated&&g.fieldsCreated.length)?g.fieldsCreated.join(', '):'none';
const tag=((form['Tag']||'')+'').trim();
const start=form.submittedAt;
let dur=0; try{ if(start) dur=Math.max(0,Math.round(($now.toMillis()-new Date(start).getTime())/1000)); }catch(e){}
const trig='form';
const errors=g.createdFieldError?1:0;
const lines=[
'**'+inCount+' domains in, '+upserted+' upserted**',
'',
'**Table:** '+modeTxt+' · '+tableName+' ('+tableId+')',
'',
'**Tag:** '+(tag||'none'),
'',
'**Domains**',
'- **In:** '+inCount,
'- **Upserted:** '+upserted,
'- **With public emails:** '+hasPublic,
'- **Without a public email:** '+noPublic,
'- **Skipped (empty domain):** '+skipped,
'',
'**Fields created:** '+fc
];
if(g.createdFieldError){ lines.push('','**Warning:** '+g.createdFieldError); }
if(g.buildNameIgnored){ lines.push('','**Build name ignored:** an Existing Table ID was supplied.'); }
lines.push('','**Source:** DiscoLike ('+trig+'-launched)');
const log={
  'Automation':'Discolike Domains -> Clayroots',
  'Status': errors?'Succeeded with errors':'Succeeded',
  'Trigger': trig,
  'Errors': errors,
  'Run at': $now.toISO(),
  'Target': tableName+' ('+tableId+')',
  'Records In': inCount,
  'Records Out': upserted,
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(clientRec.length){ log['Client']=clientRec; } else { delete log['Client']; }
return [{ json: log }];