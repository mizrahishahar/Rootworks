// Build Companies: one Companies row per ICP-approved company, in the register's shape
// (List Building 2.0, Operator rulings 2026-09-02). The signal is a relation: `Signals` links
// the row to the mirror row Resolve Mirror Row found, unioned with the links the row already
// holds. `Signal At` is now, `ICP Reason` the verdict, the Review / Trustpilot payload columns
// carry the event (latest event wins). `Domain Source` = Signal only on a row this run creates:
// an existing company keeps the source that landed it. Never write null: a value the run does
// not have is omitted, never cleared. On an existing row an empty core value is omitted too (a
// signal never blanks what a landing door wrote); a payload column with no value is omitted on
// every row. No Tag: a signal is the link, not a Tag. DNC domains are counted skips, never
// rows. Only columns the table carries are written (an unknown key 422s the upsert). _stats on
// row 0 feeds Build Run Log; zero rows emit one {_empty} placeholder so the gate reaches the close.
// Reused from Handle Hiring Intent Signal; the diffs: no Existing In Role, the payload columns.
const t=$('Resolve Mirror Row').first().json;
const have=new Set(t.fieldNames||[]);
const mirrorId=t.mirrorId;
const nowIso=new Date().toISOString();
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const join=(a)=>Array.isArray(a)?a.filter(Boolean).map(String).join(', '):(a==null?'':String(a));
const kv=(o)=>o&&typeof o==='object'&&!Array.isArray(o)?Object.entries(o).map(([k,v])=>k+':'+(typeof v==='number'?v.toFixed(2):v)).join(', '):join(o);
const keys=(o)=>o&&typeof o==='object'&&!Array.isArray(o)?Object.keys(o).join(', '):join(o);
const PAYLOAD=new Set(['Review Count','Review Latest','Review Link','Review Titles','Review Quotes','Review Replied','Trustpilot Rating','Trustpilot Reviews Total','Trustpilot URL']);
const stats={ icp:0, no_domain:0, dnc:0, created:0, updated:0, kept:0, failed:[] };

// Rows already in Companies for the signalled domains: they keep Domain Source and their links.
const existing={};
try{ for(const it of $('Get Existing Companies').all()){ const j=it.json||{}; const f=j.fields||{}; const d=norm(f.Domain); if(j.id&&d) existing[d]={ id:j.id, signals:(Array.isArray(f.Signals)?f.Signals:[]).map(x=>(x&&typeof x==='object')?x.id:x).filter(Boolean) }; } }catch(e){}

// DNC at landing (Operator ruling 2026-09-02): a protected domain never gets a Companies row.
const dnc=new Set();
try{ for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const d=norm((j.fields&&j.fields.Domain)||j.Domain||''); if(d) dnc.add(d); } }catch(e){}

const icpRows=$('Apply ICP').all().map(i=>i.json).filter(c=>c&&c.domain);
const out=[];
for(const e of icpRows){
  stats.icp++;
  const d=norm(e.domain); if(!d){ stats.no_domain++; continue; }
  if(dnc.has(d)){ stats.dnc++; continue; }
  const c=e.company||{}; const b=e.biz||null; const s=c.signal||{}; const addr=(b&&b.address)||{};
  const ex=existing[d]||null;
  const signals=Array.from(new Set([].concat(ex?ex.signals:[], [mirrorId])));
  const row={
    'Domain': d,
    'Company': String(c.company||(b&&b.name)||'').trim(),
    'Country': String(addr.country||c.country||''),
    'Employees': band((b&&b.employees)||c.headcount),
    'Signals': signals,
    'Signal At': nowIso,
    'ICP Reason': e.icp_reason||''
  };
  if(b){ Object.assign(row, {
    'Description': String(b.description||''),
    'Industry Groups': kv(b.industry_groups),
    'Business Model': kv(b.business_model),
    'Revenue Range': String(b.revenue_range||''),
    'Keywords': keys(b.keywords),
    'State': String(addr.state||''), 'City': String(addr.city||''), 'Street': String(addr.street||''), 'Zip': String(addr.zip||''),
    'Phones': join(b.phones), 'Public Emails': join(b.public_emails), 'public_emails_clean': '',
    'Social URLs': join(b.social_urls),
    'MX Provider': String(b.mx_provider||''), 'Redirect Domain': String(b.redirect_domain||'')
  }); }
  if(!ex) row['Domain Source']='Signal';
  Object.assign(row, {
    'Review Count': s.count||0, 'Review Latest': s.latest_date||'', 'Review Link': s.latest_url||'',
    'Review Titles': s.titles||'', 'Review Quotes': s.quotes||'', 'Review Replied': s.replied_label||'',
    'Trustpilot Rating': s.trust_score, 'Trustpilot Reviews Total': s.total_reviews,
    'Trustpilot URL': s.trustpilot_url||''
  });
  // Never null. Empty payload values omitted everywhere; empty core values omitted on existing rows.
  for(const k of Object.keys(row)){ const v=row[k]; if(v==null||!have.has(k)||(v===''&&(ex||PAYLOAD.has(k)))) delete row[k]; }
  if(ex&&row['Public Emails']!==undefined&&have.has('public_emails_clean')) row['public_emails_clean']='';
  if(ex) stats.updated++; else stats.created++;
  out.push({ json: row }); stats.kept++;
}
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
