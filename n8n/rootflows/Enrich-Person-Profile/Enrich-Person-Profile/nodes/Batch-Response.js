// Batch Response: the last node of the sub-execution; its output is what the parent receives.
// Counters only, never rows.
let s={}; try{ s=($('Merge').first().json||{})._stats||{}; }catch(e){}
let w={}; try{ w=$('Write Check').first().json||{}; }catch(e){}
return [{ json:{ rows:s.rows||0, answered:s.answered||0, filled:s.filled||0, written:w.written||0, writeErrors:w.writeErrors||0 } }];
