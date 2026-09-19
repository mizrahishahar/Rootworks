const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let n={}; try{ n=$('Normalize Booking').first().json||{}; }catch(e){}
const kind=n.kind||'created';
if(!n._ignore && kind!=='created'){
  // Cancel / reschedule: this branch never runs client resolution or attribution, the meeting was found
  // directly by Booking UID. A separate, smaller description shape from the booked-path one below.
  let mt=null; try{ mt=$('Read Meeting').first().json; }catch(e){}
  let rp=null; try{ rp=$('Read Changed Prospect').first().json; }catch(e){}
  let nudge=null; try{ nudge=$('Build Cancel Nudge').first().json; }catch(e){}
  let posted=false; try{ const s=$('Post Cancel Nudge').first().json||{}; posted=!!(s.ts||(s.message&&s.message.ts)||s.ok===true); }catch(e){}
  let woken=false; try{ const s=$('Wake Operator Changed').first().json||{}; woken=!(s&&s.error); }catch(e){}
  const who=(n.fullName||'')+(n.email?' <'+n.email+'>':'');
  const lines=['- **Source:** '+(n.source||'?')+' · '+kind, '- **Booking UID looked up:** '+(n.lookupUid||'?'), '- **Attendee:** '+(who||'?')];
  let head=''; const skipped=[]; const failed=[];
  if(!mt||!mt.found){
    head='Cancel/reschedule for an unheld booking';
    skipped.push('Booking UID '+(n.lookupUid||'?')+' has no Meetings row (not ours, or already gone)');
  } else {
    head=(kind==='cancelled'?'Meeting cancelled':'Meeting rescheduled');
    lines.push('- **Meeting:** '+mt.meetingId);
    lines.push('- **Prospect:** '+((rp&&rp.prospectId)?rp.prospectId:'?'));
    if(kind==='cancelled'){
      lines.push('- **Prospect stamped:** OutreachStatus = Positive Reply, Follow-ups = 0, NextTouchDate cleared');
      lines.push('- **Call nudge:** '+((nudge&&nudge.post)?(posted?'posted to thread '+nudge.threadTs:'FAILED to post'):'not eligible (missing phone, BDR thread, or BDR channel)'));
      if(nudge&&nudge.post&&!posted) failed.push('cancel nudge not posted');
    } else {
      lines.push('- **Meeting moved to:** '+(n.startTime||'?'));
      lines.push('- **New Booking UID:** '+(n.newUid||'?'));
      lines.push('- **NextTouchDate:** cleared');
    }
    lines.push('- **Operator woken:** '+(woken?'yes':'NOT woken')); if(!woken) failed.push('operator wake not sent');
  }
  let desc='**'+head+': '+(n.fullName||n.email||'?')+'**\n\n'+lines.join('\n');
  if(skipped.length) desc+='\n\n**Skipped ('+skipped.length+')**\n'+skipped.map(x=>'- '+x).join('\n');
  if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
  const row={ 'Automation':'Enrich & Qualify new lead from Booking', 'Status':failed.length?'Succeeded with errors':'Succeeded', 'Run at':$now.toISO(), 'Records In':1, 'Records Out':(mt&&mt.found?1:0), 'Errors':failed.length, 'Target':n.email||n.lookupUid||'', 'Trigger':'event', 'Execution ID':String($execution.id), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Duration s':Math.round(($now.toMillis()-(rs||$now.toMillis()))/1000), 'Description':desc };
  return [{ json: row }];
}
let c={}; try{ c=$('Resolve Client').first().json||{}; }catch(e){}
let p=null; try{ p=$('Resolve Prospect').first().json; }catch(e){}
let lists=null; try{ lists=$('Assess Lists').first().json; }catch(e){}
let seq=null; try{ seq=$('Assess Lead').first().json; }catch(e){}
let v=null; try{ v=$('Flatten Verdict').first().json; }catch(e){}
let meetingId=''; try{ meetingId=$('Create Meeting').first().json.id||''; }catch(e){}
let stamped=false; try{ stamped=!!($('Stamp Booked').first().json||{}).id; }catch(e){}
let posted=false; try{ const s=$('Post Booking Card').first().json||{}; posted=!!(s.ts||(s.message&&s.message.ts)||s.ok===true); }catch(e){}
const failed=[]; const skipped=[];
const who=(n.fullName||'')+' <'+(n.email||'')+'>'+(n.domain?' ('+n.domain+')':'');
const lines=['- **Source:** '+(n.source||'?')+(n.bookingUid?' ('+n.bookingUid+')':''), '- **Attendee:** '+who, '- **When:** '+(n.startTime||'?')+(n.title?' · '+n.title:'')];
let head='';
if(n._ignore){ head='Ignored'; skipped.push(n.reason||'not a booking'); }
else if(!c.clientRecId){ head='Unresolved client'; skipped.push(c.resolution||'no client matched'); }
else if(c.clientMeeting){ head='Client meeting, not a lead'; skipped.push(c.resolution); lines.push('- **Client:** '+c.clientName); }
else {
  lines.push('- **Client:** '+c.clientName+' ('+(c.resolution||'')+')');
  if(p&&p.prospectId){
    head=(p.tier==='Replied'?'Inbox lead booked':p.tier==='Sequenced'?'Sequenced lead booked (never replied)':p.tier==='Sourced'?'Sourced lead booked (company on our list)':'Lead booked');
    lines.push('- **Attribution:** '+(p.tier||'?')+' · '+(p.why||''));
    lines.push('- **Prospect:** '+(p.existed?'matched existing row':'created')+' ('+p.prospectId+')');
    lines.push('- **Qualification:** '+(v?(v.qualificationStatus+(v.verdictReason?' · '+v.verdictReason:'')+(v.kbFound===false?' (no qualification-prompt KB row for this client, generic rubric used)':'')):'NOT run'));
    if(!v) failed.push('qualification did not produce a verdict');
    if(v) lines.push('- **Base:** '+(v.baseSource||'unknown')+(v.baseMatch?' (matched on '+v.baseMatch+')':'')+(v.baseReason?' ('+v.baseReason+')':''));
    lines.push('- **Stamped:** '+(stamped?'OutreachStatus = Scheduled Call, Call Booked At, QualificationStatus, Qualification Brief, contextNotes'+(c.isFlowroots?', PipelineStatus = Scheduled Call':''):'NOT stamped')); if(!stamped) failed.push('prospect not stamped');
    lines.push('- **Meeting:** '+(meetingId?'Meetings row created ('+meetingId+')':'NOT created')); if(!meetingId) failed.push('meeting row not created');
    if(c.slackChannel){ lines.push('- **Slack:** '+(posted?'card posted to '+c.slackChannel:'card NOT posted')); if(!posted) failed.push('slack card not posted'); }
  } else {
    head='Booking not attributed';
    skipped.push('not ours: '+(seq&&seq.why?seq.why:'')+(lists&&lists.why?'; '+lists.why:''));
    lines.push('- **Outcome:** no prospect, no meeting row; this booker was not generated by us');
  }
}
let desc='**'+head+': '+(n.fullName||n.email||'?')+'**\n\n'+lines.join('\n');
if(skipped.length) desc+='\n\n**Skipped ('+skipped.length+')**\n'+skipped.map(x=>'- '+x).join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
const row={ 'Automation':'Enrich & Qualify new lead from Booking', 'Status':failed.length?'Succeeded with errors':'Succeeded', 'Run at':$now.toISO(), 'Records In':1, 'Records Out':(p&&p.prospectId?1:0)+(meetingId?1:0), 'Errors':failed.length, 'Target':n.email||'', 'Trigger':'event', 'Execution ID':String($execution.id), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Duration s':Math.round(($now.toMillis()-(rs||$now.toMillis()))/1000), 'Description':desc };
if(c.clientRecId) row['Client']=[c.clientRecId];
return [{ json: row }];
