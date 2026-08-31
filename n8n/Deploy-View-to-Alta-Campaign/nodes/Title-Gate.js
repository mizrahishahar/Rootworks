// Title Gate: Alta's OWN enriched person data against the buyer rule, after landing. Alta
// stores its own title for a person, and it can disagree with ours; nothing that checks only
// our side can catch that (the Lewin Joey incident, 2026-08-27). The rule here mirrors the
// `relevance` formula on the intent tables; a landed prospect whose Alta-side title fails it
// is paused by the next node before a message can go out, and named in the run log.
// Identity too: a person whose Alta LinkedIn URL is not the URL we pushed is paused.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{prospectIds:[], action:'pause', _none:true}}]; }
let persons=[];
try{ const j=($input.first()||{}).json||{}; persons=Array.isArray(j.rows)?j.rows:[]; }catch(e){}
const normUrl=u=>String(u||'').toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'').split('?')[0];
const roleOnly=t=>{ let s=String(t||''); s=s.split(/\s+\|\s+|\s+@\s+/)[0]; s=s.replace(/\s+at\s+[^|]*$/i,''); return s.trim(); };
const EXEC=/\b(founder|founding|co-?founder|owner|ceo|cto|cio|ciso|coo|president|chief)\b/i;
const LEAD=/\b(vp|svp|evp|vice president|head|director|manager|lead|principal|staff)\b/i;
const TECH=/\b(engineering|engineer|technology|technical|infrastructure|infra|platform|devops|sre|site reliability|cloud|security|information security|it|software|systems|architecture|architect|data|product)\b/i;
const IC=/\b(devops|site reliability|sre|platform engineer|infrastructure engineer|cloud engineer|systems engineer|production engineer|release engineer|founding engineer)\b/i;
const STANDALONE=/^(managing director|executive director|senior director|director|partner)$/i;
const NEVER=/\b(marketing|sales|growth|revenue|people|talent|recruiting|recruiter|hr|human resources|finance|financial|accounting|brand|content|community|customer|client|account|assistant|product owner|chief of staff|mechanical|facilities|contracts|capture|alliances|legal|gis|writer|veteran|medical|clinical|program|managed services|creative|design|designer|gtm|partnerships|strategy|staffing)\b/i;
const passes=(title)=>{ const t=roleOnly(title); if(!t) return false; if(NEVER.test(t)) return false; return EXEC.test(t)||(LEAD.test(t)&&TECH.test(t))||IC.test(t)||STANDALONE.test(t.trim()); };
const pause=[]; const pausedNames=[];
let landed=0, titleFail=0, urlMismatch=0, noData=0;
for(const p of persons){
  const fp=D.freshProspects[p.personId];
  const url=normUrl(p.linkedinUrl);
  const rowId=url?D.urlToRow[url]:'';
  if(!fp){
    // An older member matching a row we just pushed: it landed in a prior run and was never
    // stamped. Stamp it now; never pause old actives here (the standing audit owns them).
    if(rowId&&D.rows[rowId]&&!D.rows[rowId].skip&&!D.rows[rowId].landed){ landed++; D.rows[rowId].landed=true; D.rows[rowId].healed=true; }
    continue;
  }
  if(!p.name&&!p.linkedinUrl){ noData++; pause.push(fp.prospectId); pausedNames.push((p.personId||'?')+' (no person data)'); continue; }
  if(!rowId){ urlMismatch++; pause.push(fp.prospectId); pausedNames.push((p.name||url||'?')+' (URL not one we pushed)'); continue; }
  if(!passes(p.title)){ titleFail++; pause.push(fp.prospectId); pausedNames.push((p.name||'?')+' ('+(roleOnly(p.title)||'no title')+')'); if(D.rows[rowId]) D.rows[rowId].skip='paused: Alta-side title failed the buyer rule'; continue; }
  landed++;
  if(D.rows[rowId]) D.rows[rowId].landed=true;
}
D.landed=landed; D.pausedTitle=titleFail; D.pausedUrl=urlMismatch; D.pausedNoData=noData; D.pausedNames=pausedNames.slice(0,25);
// Rows pushed but not matched by any fresh person: not landed.
let sentNoLand=0;
for(const id of Object.keys(D.rows)){ const rec=D.rows[id]; if(!rec.skip&&!rec.landed){ rec.skip='not in campaign after deploy'; sentNoLand++; } }
D.missing=sentNoLand;
if(!pause.length) return [{json:{_none:true, prospectIds:[], action:'pause'}}];
return [{json:{prospectIds:pause, action:'pause'}}];
