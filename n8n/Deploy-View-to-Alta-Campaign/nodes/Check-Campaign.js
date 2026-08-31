// Check Campaign: the Hub Campaigns row for the target. Two hard facts come from it:
// the campaign is an Alta campaign, and its Pull-in URL (the audience webhook Alta hands out
// per campaign; no API exposes it, so it is operator-pasted state on the campaign row).
// No row, wrong sequencer, or no Pull-in URL = abort before anything is sent.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(!D.abort){
  const rows=$input.all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
  const hit=rows[0];
  if(!hit){ D.abort='campaign not in Hub'; D.errors.push('no Campaigns row with Campaign ID '+D.target+'; sync or create it first'); }
  else{
    const f=hit.fields||hit;
    D.hubCampaignRid=hit.id||'';
    D.campName=String(f['Campaign']||D.target);
    const seq=String((f['Sequencer']&&f['Sequencer'].name)||f['Sequencer']||'');
    if(seq&&seq!=='Alta'){ D.abort='not an Alta campaign'; D.errors.push('campaign "'+D.campName+'" is sequenced by '+seq+', not Alta'); }
    D.pullInUrl=String(f['Pull-in URL']||'').trim();
    if(!D.abort&&!/^https:\/\/api\.altahq\.com\/audience\/webhook\/[0-9a-f-]+\/pull-in-prospect$/i.test(D.pullInUrl)){
      D.abort='no Pull-in URL'; D.errors.push('campaign "'+D.campName+'" has no valid Pull-in URL on its Campaigns row; paste the audience webhook from Alta');
    }
  }
}
return [{json:{abort:!!D.abort, crBase:D.crBase||'', target:D.target||'', metaUrl:'https://api.airtable.com/v0/meta/bases/'+(D.crBase||'missing')+'/tables'}}];
