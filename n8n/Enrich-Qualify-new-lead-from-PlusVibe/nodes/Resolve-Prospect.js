let pid='';
try{ pid=$('Create CRM Prospect').first().json.id||''; }catch(e){}
if(!pid){ try{ pid=$('Find CRM Prospect').first().json.id||''; }catch(e){} }
let dash='';
try{ dash=String(((($('Find Client Row').first().json||{}).fields)||{})['Dashboard Page ID']||'').trim(); }catch(e){ dash=''; }
let pipeline_url='';
if(pid && dash){
  try{
    const blob=JSON.stringify({pageId:'pagU8C93nMn6vPMTM',rowId:pid});
    const b64=Buffer.from(blob,'utf8').toString('base64').replace(/=+$/,'');
    pipeline_url='https://airtable.com/appQG6dK0FIOhTxOl/'+dash+'?detail='+b64;
  }catch(e){ pipeline_url=''; }
}
return [{ json: { prospect_id: pid, pipeline_url: pipeline_url } }];