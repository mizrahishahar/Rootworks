const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let n={}; try{ n=$('Normalize Booking').first().json||{}; }catch(e){}
let c={}; try{ c=$('Resolve Client').first().json||{}; }catch(e){}
let p=null; try{ p=$('Resolve Prospect').first().json; }catch(e){}
let a=null; try{ a=$('Assess Lead').first().json; }catch(e){}
let meetingId=''; try{ meetingId=$('Create Meeting').first().json.id||''; }catch(e){}
if(!meetingId){ try{ meetingId=$('Create Unattributed Meeting').first().json.id||''; }catch(e){} }
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
  if(p&&p.prospectId){ head=(p.existed?'Inbox lead booked':'Sequencer lead booked (was not in the inbox)'); lines.push('- **Prospect:** '+(p.existed?'matched existing row':'created from the sequencer lead, '+(p.why||''))+' ('+p.prospectId+')'); lines.push('- **Stamped:** '+(stamped?'OutreachStatus = Scheduled Call, Call Booked At = today'+(c.isFlowroots?', PipelineStatus = Scheduled Call':''):'NOT stamped')); if(!stamped) failed.push('prospect not stamped'); }
  else if(a&&!a.ours){ head='Booking not attributed'; skipped.push(a.why||'not ours'); }
  else { head='Booking'; failed.push('prospect neither found nor created'); }
  lines.push('- **Meeting:** '+(meetingId?'Meetings row created ('+meetingId+')':'NOT created')); if(!meetingId) failed.push('meeting row not created');
  if(c.slackChannel&&p&&p.prospectId){ lines.push('- **Slack:** '+(posted?'card posted to '+c.slackChannel:'card NOT posted')); if(!posted) failed.push('slack card not posted'); }
}
let desc='**'+head+': '+(n.fullName||n.email||'?')+'**\n\n'+lines.join('\n');
if(skipped.length) desc+='\n\n**Skipped ('+skipped.length+')**\n'+skipped.map(x=>'- '+x).join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
const row={ 'Automation':'Handle New Booking', 'Status':failed.length?'Succeeded with errors':'Succeeded', 'Run at':$now.toISO(), 'Records In':1, 'Records Out':(p&&p.prospectId?1:0)+(meetingId?1:0), 'Errors':failed.length, 'Target':n.email||'', 'Trigger':'event', 'Execution ID':String($execution.id), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Duration s':Math.round(($now.toMillis()-(rs||$now.toMillis()))/1000), 'Description':desc };
if(c.clientRecId) row['Client']=[c.clientRecId];
return [{ json: row }];
