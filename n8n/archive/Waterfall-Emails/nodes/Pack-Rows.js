const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
let started=''; try{ started=$('Email Guard').first().json.startedAt||''; }catch(e){}
let cid=''; try{ cid=p.clientRecordId||''; }catch(e){}
if(!cid){ try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) cid=rc.id; }catch(e){} }
let trig='form';
if(!p._launchRecordId){ try{ if($('Record Webhook').first().json) trig='webhook'; }catch(e){} }
let total=0; try{ total=$('Fetch Rows').all().filter(i=>i.json&&i.json.id).length; }catch(e){}
const cap=Number(p['Max Rows'])||100000;
const ctx={ _baseId:p['Clayroots Base ID'], _tableId:t.tableId, _tableName:t.tableName, _view:String(p['View']||''), _execId:String($execution.id), _startedAt:started||new Date().toISOString(), _clientId:cid, _trigger:trig, _total:Math.min(total,cap) };
return $input.all().map(i=>({ json:Object.assign({},i.json,ctx) }));