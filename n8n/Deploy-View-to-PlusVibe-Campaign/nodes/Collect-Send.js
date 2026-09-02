const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk]; const S=D.send;
const j=($input.first()||{}).json||{};
const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
const rb=hasWrap?j.body:j;
const status=Number(j.statusCode||0);
const fmt=v=>Number(v||0).toLocaleString('en-US');
// Live progress written to the launch row after every chunk (Stamp Progress hangs off this output as a side branch; it must NEVER sit between this node and Send Done?, its Airtable output would destroy the loop state).
const emit=(o)=>{ const P=D.pv||{}; const total=S.queue.length||1; const doneChunks=Math.min(S.idx,total);
  const lines=['**Uploading to '+(D.campName||'?')+'**','','- Chunk '+fmt(doneChunks)+' of '+fmt(total),'- Sent so far: '+fmt(P.sent),'- Accepted so far: '+fmt(P.uploaded)];
  if(P.skipped) lines.push('- Already in the workspace, blocked by dedupe: '+fmt(P.skipped));
  if(P.duplicate) lines.push('- Same email twice in the upload: '+fmt(P.duplicate));
  lines.push('','Read-back and the full report follow once uploading finishes.');
  return [{json:Object.assign({_lid:D.launchId||'', _prog:lines.join('\n')}, o)}]; };
const mkBody=(chunk)=>Object.assign({workspace_id:D.ws, campaign_id:D.target, leads:chunk}, D.flags||{});
const advance=()=>{ if(S.idx<S.queue.length){ S.queue[S.idx]=null; } S.idx++; S.attempts=0; if(S.idx<S.queue.length&&S.queue[S.idx]) return emit({body:mkBody(S.queue[S.idx]), wait:2}); return emit({done:true, wait:0}); };
if(j.error&&!hasWrap&&!status){
  // The HTTP node itself errored (no request went out). Retry the same chunk, capped.
  S.attempts++;
  if(S.attempts<=3&&S.queue[S.idx]) return emit({body:mkBody(S.queue[S.idx]), wait:Math.pow(2,S.attempts)});
  D.errors.push('lead/add chunk '+(S.idx+1)+'/'+S.queue.length+' node error: '+String(j.error).slice(0,200));
  return advance();
}
const cur=S.queue[S.idx]||[];
const ok=status>=200&&status<300&&rb&&typeof rb==='object'&&!Array.isArray(rb);
if(ok){
  D.pv=D.pv||{sent:0,uploaded:0,duplicate:0,already:0,invalid:0,skipped:0,overwritten:0,overflowed:0,remaining:null};
  const P=D.pv;
  const num=(v)=>{ const n=Number(v); return Number.isFinite(n)?n:0; };
  P.sent+=num(rb.totalsent!==undefined?rb.totalsent:rb.total_sent);
  const up=num(rb.leadsuploaded!==undefined?rb.leadsuploaded:(rb.leads_uploaded!==undefined?rb.leads_uploaded:rb.uploaded_count));
  P.uploaded+=up;
  P.duplicate+=num(rb.duplicateemailcount!==undefined?rb.duplicateemailcount:rb.duplicate_email_count);
  P.already+=num(rb.alreadyincampaign!==undefined?rb.alreadyincampaign:rb.already_in_campaign);
  P.invalid+=num(rb.invalidemailcount!==undefined?rb.invalidemailcount:rb.invalid_email_count);
  P.skipped+=num(rb.skipped);
  P.overwritten+=num(rb.overwritten);
  P.overflowed+=num(rb.overflowedleadcount!==undefined?rb.overflowedleadcount:rb.overflowed_lead_count);
  const rem=rb.remaininginplan!==undefined?rb.remaininginplan:rb.remaining_in_plan;
  if(rem!==undefined&&rem!==null&&Number.isFinite(Number(rem))) P.remaining=Number(rem);
  D.uploadedNew+=up;
  return advance();
}
let idxs=[];
if(rb&&Array.isArray(rb.invalid_indexes)) idxs=rb.invalid_indexes.filter(Number.isFinite);
else if(rb&&Array.isArray(rb.errors)) idxs=rb.errors.map(e=>(e&&(e.index!==undefined?e.index:e.lead_index))).filter(Number.isFinite);
if(status===400&&idxs.length){
  const bad=new Set(idxs);
  const keep=[];
  cur.forEach((l,i)=>{
    if(bad.has(i)){
      D.errors.push('lead rejected by PV validation, dropped: '+((l&&l.email)||('index '+i)));
      const rid=D.emailToRow[String((l&&l.email)||'').toLowerCase()];
      if(rid&&D.rows[rid]&&!D.rows[rid].skip) D.rows[rid].skip='rejected by PV validation';
    } else keep.push(l);
  });
  if(keep.length){ S.queue[S.idx]=keep; return emit({body:mkBody(keep), wait:2}); }
  return advance();
}
const bs=JSON.stringify(rb||{}).toLowerCase();
if((status===413||status===400)&&cur.length>25&&/too large|payload|entity|body size|request size/.test(bs)){
  const half=Math.ceil(cur.length/2);
  const a=cur.slice(0,half), b=cur.slice(half);
  S.queue.splice(S.idx,1,a,b);
  return emit({body:mkBody(a), wait:2});
}
S.attempts++;
if(S.attempts<=3&&cur.length) return emit({body:mkBody(cur), wait:Math.pow(2,S.attempts)});
D.errors.push('lead/add chunk '+(S.idx+1)+'/'+S.queue.length+' failed after 3 retries (status '+(status||'?')+'): '+JSON.stringify(rb).slice(0,200));
return advance();