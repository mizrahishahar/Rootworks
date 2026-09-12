const parse=(raw)=>{ try{ let s=raw; if(typeof s==='object'&&s.data)s=s.data; if(typeof s!=='string')s=JSON.stringify(s); const m=s.match(/data:\s*(\{[\s\S]*\})/); const rpc=JSON.parse(m?m[1]:s); const txt=rpc.result&&rpc.result.content&&rpc.result.content[0]&&rpc.result.content[0].text; return txt?JSON.parse(txt):null; }catch(e){ return null; } };
const p=parse($input.first().json);
const personId=(p&&p.personId)||'';
return [{ json: { personId, callBody: personId ? {jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'get_person',arguments:{personId}}} : null } }];