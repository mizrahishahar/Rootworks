let id='', row=null;
try{ const f=$('Search Campaign').first(); if(f&&f.json&&f.json.id){ id=f.json.id; row=f.json; } }catch(e){}
if(!id){ try{ const c=$('Create Campaign Row').first(); if(c&&c.json&&c.json.id){ id=c.json.id; row=c.json; } }catch(e){} }
const g=(k)=>{ try{ if(!row) return ''; if(row[k]!=null) return row[k]; if(row.fields&&row.fields[k]!=null) return row.fields[k]; }catch(e){} return ''; };
return [{ json: {
  campaignRowId: id,
  campaignName: g('Campaign'),
  contacted: g('Contacted'),
  replies: g('Replies'),
  replyRate: g('Reply Rate'),
  positives: g('Positive Replies (CRM)'),
  positiveRate: g('Positive Rate'),
  status: (function(){ const s=g('Status'); return (s&&typeof s==='object')?(s.name||''):s; })()
} }];