// Batch Response: the last node of the sub-execution; its output is what the parent receives.
// Counters only, never rows.
let s={}; try{ s=$('Verdict').first().json._stats||{}; }catch(e){}
let w={}; try{ w=$('Write Check').first().json||{}; }catch(e){}
return [{ json:{ done:s.done||0, verifying:s.verifying||0, noEmail:s.noEmail||0, errored:s.errored||0, written:w.written||0, writeErrors:w.writeErrors||0 } }];
