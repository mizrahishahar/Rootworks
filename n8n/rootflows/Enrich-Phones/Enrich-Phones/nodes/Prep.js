// Prep: the batch's state and the one FullEnrich submission it makes, one item.
//
// The rule: FullEnrich is the only lookup. A person whose phone cell is already filled is answered
// from it and never sent (the view is the spend cap: feed this Rootflow a view where Phone is empty
// when a fresh lookup is what you want). Everyone else is asked once, by LinkedIn URL when the row
// holds one, else by first name + last name + domain. A person with neither cannot be asked: the row
// is marked error with the reason and costs nothing.
//
// One batch is at most 100 people, which is exactly FullEnrich's bulk maximum: one batch, one
// submission, contact.phones only (10 credits a number found, nothing for a miss). The row id rides
// in `custom` and comes back on the result, so the answer is matched by id, never by position.
const rows=$('Read Records').all().map(i=>i.json||{}).filter(j=>j.id);
const first=rows[0]||{};
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const cut=(v)=>String(v||'').slice(0,100);
const state={ mode:first._mode||'view', order:[], rows:{}, stats:{ rows:rows.length, fromDatabase:0, notAskable:0, asked:0 } };
const data=[];
for(const r of rows){
  const p=r.person||{};
  const row={ id:r.id, resolved:null, asked:false, error:'' };
  if(p.held&&plausible(p.held)){
    row.resolved={ phone:p.held, provider:'database', type:'unknown' };
    state.stats.fromDatabase++;
  } else if(p.linkedin||(p.first&&p.last&&p.domain)){
    const c={ enrich_fields:['contact.phones'], custom:{ row_id:String(r.id) } };
    if(p.first&&p.last){ c.first_name=cut(p.first); c.last_name=cut(p.last); }
    if(p.domain) c.domain=cut(p.domain);
    if(p.linkedin) c.linkedin_url=p.linkedin;
    data.push(c);
    row.asked=true;
    state.stats.asked++;
  } else {
    row.error='cannot be asked: no LinkedIn URL and no first name + last name + domain';
    state.stats.notAskable++;
  }
  state.order.push(r.id);
  state.rows[r.id]=row;
}
state._none=!data.length;
state.body={ name:'Enrich Phones '+String(first._execId||'')+' ('+(first._tableName||'People')+', '+data.length+')', data };
return [{ json:state }];
