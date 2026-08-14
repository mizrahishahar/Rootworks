const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{
  const s=String(v==null?'':v).trim();
  if(!s) return '';
  if(BANDS.indexOf(s)>-1) return s;
  const n=Number(s.replace(/[,\s]/g,''));
  if(!isFinite(n)) return s;
  if(n<=0) return '';
  if(n<=10) return '1-10';
  if(n<=50) return '11-50';
  if(n<=200) return '51-200';
  if(n<=500) return '201-500';
  if(n<=1000) return '501-1000';
  if(n<=5000) return '1001-5000';
  if(n<=10000) return '5001-10000';
  return '10001+';
};
const out=[];
for(const it of $('Companies Handler').all()){
  const j = Object.assign({}, it.json);
  delete j._sheet_id; delete j.query_name; delete j.ingested_at;
  // Operator ruling 2026-08-12: company_clean retired, the cleaned name is already in Name.
  delete j.company_clean;
  // 'Source' splits into 'Contact Source' (record provenance) and 'Email Source' (waterfall tier).
  if(Object.prototype.hasOwnProperty.call(j,'Source')){ if(j['Contact Source']===undefined) j['Contact Source']=j.Source; delete j.Source; }
  const d = String(j.Domain==null?'':j.Domain).trim();
  if(!d) continue;
  if(Object.prototype.hasOwnProperty.call(j,'Employees')) j.Employees = band(j.Employees);
  out.push({ json: j });
}
return out;