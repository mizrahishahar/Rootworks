const form=$('Contacts Launch').first().json;
const started=form.submittedAt||$('Config').first().json.startedAt;
const pd=$('Parse Domains').first().json;
const domainsIn=pd._domain_count||0;
const chunks=$('SQ Guard').all().map(i=>i.json);
let failedChunks=0; try{ failedChunks=Math.max(0,$('SQ Enrich').all().length-chunks.length); }catch(e){}
let companiesMatched=0, credits=0;
const domainsWith=new Set();
for(const c of chunks){
  const rs=Array.isArray(c.results)?c.results:[];
  companiesMatched+=rs.length;
  for(const r of rs){ const cts=Array.isArray(r.contacts)?r.contacts:[]; for(const ct of cts){ const d=String(ct.company_domain||'').trim().toLowerCase(); if(d)domainsWith.add(d); } }
  const cr=c.credits_used!=null?c.credits_used:(c.credits!=null?c.credits:((c.usage&&c.usage.credits_used)||0));
  credits+=Number(cr)||0;
}
const delivered=$('Format Supersoniq').all().length;
const sd=$getWorkflowStaticData('global');
const skipped=Number(sd.contactsSkipped)||0;
const zeroDomains=Math.max(0,domainsIn-domainsWith.size);
const overflowCount=Number(sd.overflowCount)||0;
const overflowUrl=sd.overflowUrl||'';
const overflowError=sd.overflowError||'';
let clientRec=[]; try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id)clientRec=[rc.id]; }catch(e){}
const g=$('Contacts Table Guard').first().json||{};
const tableName=g.tableName||'';
const tableId=g.tableId||'';
const modeTxt=(g.mode==='append')?'appended to an existing table':'created a new table';
const fc=(g.fieldsCreated&&g.fieldsCreated.length)?g.fieldsCreated.join(', '):'none';
const tag=((form['Tag']||'')+'').trim();
let dur=0; try{ if(started)dur=Math.max(0,Math.round((Date.now()-new Date(started).getTime())/1000)); }catch(e){}
const trig=form._launchRecordId?('record-launched by '+form._launchRecordId):'form-launched';
const errors=(g.createdFieldError?1:0)+failedChunks+(overflowError?1:0);
const fmt=v=>Number(v||0).toLocaleString('en-US');
const parts=[];
parts.push('**'+fmt(domainsIn)+' domains in, '+fmt(delivered)+' contacts delivered**');
parts.push('**Tag:** '+(tag||'none'));
parts.push('**Supersoniq**\n- **Companies matched:** '+fmt(companiesMatched)+'\n- **Contacts delivered:** '+fmt(delivered)+'\n- **Credits used:** '+fmt(credits)+'\n- **Domains with zero contacts:** '+fmt(zeroDomains)+'\n- **Rows skipped (empty Contact Key):** '+fmt(skipped));
parts.push('**Table:** '+modeTxt+', '+tableName+' ('+tableId+')\n**Fields created:** '+fc);
if(overflowUrl){ parts.push('**Leads Overflow report:** '+fmt(overflowCount)+' domains without contacts\n'+overflowUrl); }
else if(overflowCount>0&&!overflowError){ parts.push('**Leads Overflow report:** '+fmt(overflowCount)+' domains without contacts, not uploaded.'); }
const warns=[];
if(failedChunks){ warns.push('- '+failedChunks+' Supersoniq chunk(s) failed and were dropped.'); }
if(g.createdFieldError){ warns.push('- '+g.createdFieldError); }
if(g.buildNameIgnored){ warns.push('- Build name ignored: an Existing Table ID was supplied.'); }
if(overflowError){ warns.push('- '+overflowError); }
if(warns.length){ parts.push('**Warnings ('+warns.length+')**\n'+warns.join('\n')); }
parts.push('**Source:** Storeleads CSV ('+trig+')');
const log={
  'Automation': 'Storeleads Domains -> Supersoniq -> Clayroots',
  'Status': errors?'Succeeded with errors':'Succeeded',
  'Trigger': 'form',
  'Errors': errors,
  'Run at': new Date().toISOString(),
  'Target': tableName+' ('+tableId+')',
  'Records In': domainsIn,
  'Records Out': delivered,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(clientRec.length){ log['Client']=clientRec; }
return [{ json: log }];