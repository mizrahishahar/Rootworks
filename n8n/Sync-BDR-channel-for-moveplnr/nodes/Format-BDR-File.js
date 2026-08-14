const date=new Date().toISOString().split('T')[0];
try {
  let members=[]; try{ members=$('Users List').first().json.members||[]; }catch(e){ members=[]; }
  const names={}; members.forEach(u=>{names[u.id]=u.real_name||(u.profile&&u.profile.display_name)||u.name||u.id;});
  const resolve=(t)=>String(t||'').replace(/<@([A-Z0-9]+)>/g,(_,id)=>'@'+(names[id]||id));
  const nm=(m)=>{if(!m)return 'Unknown';const p=m.user_profile||{};const bp=m.bot_profile||{};return p.real_name||p.display_name||bp.name||m.username||names[m.user]||m.user||'Unknown';};
  const fmt=(m)=>{let b='**'+nm(m)+'**: '+resolve(m&&m.text);const reps=(m&&m.replies)||[];if(reps.length){b+='\n'+reps.map(r=>'  > **'+nm(r)+'**: '+resolve(r&&r.text)).join('\n');}return b;};
  const bdr=$input.all().map(i=>i.json).filter(x=>x&&x.channel==='BDR').map(x=>x.msg).filter(Boolean).reverse();
  const content='# '+date+' — Slack BDR (moveplnr-bdr)\n\n'+(bdr.length?bdr.map(fmt).join('\n\n'):'_No activity._');
  return [{json:{content, filename: date+' - Slack BDR.md'}}];
} catch(e){
  return [{json:{content:'# '+date+' — Slack BDR\n\nFORMAT ERROR: '+String((e&&e.message)||e), filename: date+' - Slack BDR.md'}}];
}