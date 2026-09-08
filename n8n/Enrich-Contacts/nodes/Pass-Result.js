// Pass Result: one batch closed (Run Batch, awaited). The sub's last node answers with its
// counters (Batch Response); its own Hub row is already written when it answers. A crash arrives
// as an error item: the parent continues past a dead batch and logs it, it never retries one.
// stop = a batch where every provider that was asked failed: no further batches, straight to the
// close (a provider that was skipped for want of a credential is not a failure).
let batchNum=0; try{ batchNum=Number($('Loop Batches').first().json.batchNum)||0; }catch(e){}
const j=$input.first().json||{};
const out={ batchNum:batchNum, key:String(batchNum), status:'closed', written:0, allFailed:false, stop:false, reason:'' };
if(j.error!==undefined&&j.error!==null&&j.error!==''){
  out.status='crashed';
  out.reason=String((typeof j.error==='object'?(j.error.message||j.error.description||JSON.stringify(j.error)):j.error)||'crashed').slice(0,200);
  return [{ json: out }];
}
if(Number(j.batchNum)>0){ out.batchNum=Number(j.batchNum); out.key=String(out.batchNum); }
out.written=Number(j.written)||0;
out.allFailed=!!j.allFailed;
if(out.allFailed){
  out.status='allFailed';
  out.reason=String((Array.isArray(j.failReasons)&&j.failReasons[0])||'every provider that was asked failed').slice(0,200);
  out.stop=true;
}
return [{ json: out }];
