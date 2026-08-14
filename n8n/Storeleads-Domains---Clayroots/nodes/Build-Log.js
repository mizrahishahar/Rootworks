const form=$('Storeleads Launch').first().json;
const started=form.submittedAt || $('Config').first().json.startedAt;
const sd=$getWorkflowStaticData('global');
const t=(sd.slBatchState&&sd.slBatchState.totals)||{pulled:0,inserted:0,withEmails:0,skipped:0};
const stores=t.pulled;
const total=t.inserted;
const hasPublic=t.withEmails;
const skipped=Number(t.skipped)||0;
const noPublic=Math.max(0,total-hasPublic);
let clientRec=[];
try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) clientRec=[rc.id]; }catch(e){}
const g=$('Companies Table Guard').first().json||{};
const tableName=g.tableName||'';
const tableId=g.tableId||'';
const modeTxt=(g.mode==='append')?'appended to an existing table':'created a new table';
const fc=(g.fieldsCreated&&g.fieldsCreated.length)?g.fieldsCreated.join(', '):'none';
const tag=((form['Tag']||'')+'').trim();
let dur=0; try{ if(started) dur=Math.max(0,Math.round(($now.toMillis()-new Date(started).getTime())/1000)); }catch(e){}
const trig='form';
const errors=g.createdFieldError?1:0;
const fmt=v=>Number(v||0).toLocaleString('en-US');
const parts=[];
parts.push('**'+fmt(stores)+' stores pulled, '+fmt(total)+' upserted**');
parts.push('**Tag:** '+(tag||'none'));
parts.push('**Results**\n- **Upserted to Domains table:** '+fmt(total)+'\n- **With public emails:** '+fmt(hasPublic)+'\n- **Without public emails:** '+fmt(noPublic)+'\n- **Skipped (empty domain):** '+fmt(skipped));
parts.push('**Table:** '+modeTxt+', '+tableName+' ('+tableId+')\n**Fields created:** '+fc);
const warns=[];
if(g.createdFieldError){ warns.push('- '+g.createdFieldError); }
if(g.buildNameIgnored){ warns.push('- Build name ignored: an Existing Table ID was supplied.'); }
if(warns.length){ parts.push('**Warnings ('+warns.length+')**\n'+warns.join('\n')); }
parts.push('**Source:** Storeleads ('+trig+'-launched)');
const log={
  'Automation':'Storeleads Domains -> Clayroots',
  'Status': errors?'Succeeded with errors':'Succeeded',
  'Trigger': trig,
  'Errors': errors,
  'Run at': $now.toISO(),
  'Target': tableName+' ('+tableId+')',
  'Records In': stores,
  'Records Out': total,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(clientRec.length){ log['Client']=clientRec; }
return [{ json: log }];