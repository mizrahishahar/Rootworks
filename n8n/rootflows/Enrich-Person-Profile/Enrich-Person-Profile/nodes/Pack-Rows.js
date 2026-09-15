// Pack Rows: the view's rows become the ask. A row already carrying Headline, Person City and
// Person Country is complete for this machine's purpose and is skipped (counted); a row with no
// Name or no Domain cannot be looked up and is skipped (counted). Every row kept carries the run
// context the batch sub-execution needs (Params and Resolve Table do not exist inside it). One
// row = one person to look up. The skip counts ride on every row so the batch log can show them.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const c=$('Check Columns').first().json;
const rows=$input.all().map(i=>i.json).filter(j=>j&&j.id);
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const st={ inView:rows.length, complete:0, noKey:0, asked:0 };
const keep=[];
for(const r of rows){
  const f=r.fields||{};
  if(one(f.Headline)&&one(f['Person City'])&&one(f['Person Country'])){ st.complete++; continue; }
  if(!one(f.Name)||!one(f.Domain)){ st.noKey++; continue; }
  st.asked++;
  keep.push({ id:r.id });
}
const ctx={ _baseId:p.base, _tableId:t.tableId, _tableName:t.tableName, _view:t.viewName, _execId:String($execution.id), _startedAt:p.startedAt, _clientId:p.clientRecId||'', _trigger:p.trigger||'form', _total:st.asked, _inView:st.inView, _complete:st.complete, _noKey:st.noKey, _maxBlitz:p.maxBlitz||0, _heldFields:c.heldFields||[], _profileFields:c.profileFields||[] };
if(!keep.length) return [{ json:Object.assign({ _empty:true }, ctx) }];
return keep.map(j=>({ json:Object.assign({}, j, ctx) }));
