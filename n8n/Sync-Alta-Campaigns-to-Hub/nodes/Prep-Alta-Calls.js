const parse=(raw)=>{ try{ let s=raw; if(typeof s==='object'&&s.data)s=s.data; if(typeof s!=='string')s=JSON.stringify(s); const m=s.match(/data:\s*(\{[\s\S]*\})/); const rpc=JSON.parse(m?m[1]:s); const txt=rpc.result&&rpc.result.content&&rpc.result.content[0]&&rpc.result.content[0].text; return txt?JSON.parse(txt):null; }catch(e){ return null; } };
const pr=$('Alta Thread Loop').first().json; const prf=pr.fields||pr;
const crow=$('Get Campaign Row').first().json||{}; const cf=crow.fields||crow;
const campaignId=cf['Campaign ID']||'';
const prospectId=prf['Alta Prospect ID']||'';
const li=parse($('MCP Get Rep LI').first().json);
const em=parse($('MCP Get Rep Email').first().json);
const repId=(li&&li.repId)||(em&&em.repId)||'';
const sd=$getWorkflowStaticData('global');
sd.altaThreads.checked++;
if(!campaignId||!prospectId||!repId){ sd.altaThreads.skipped.push((prf.Name||pr.id)+' (missing'+(!campaignId?' campaignId':'')+(!prospectId?' prospectId':'')+(!repId?' repId':'')+')'); return [{ json: { _skip:true } }]; }
const mk=(tool,type)=>({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:tool,arguments:{campaignId,prospectId,repId,type,tag:null,unread:false}}});
const out=[];
for(const type of ['campaign','received','manual','reply_agent']){ out.push({ json: { callBody: mk('list_linkedin_messages',type) } }); out.push({ json: { callBody: mk('list_email_messages',type) } }); }
return out;