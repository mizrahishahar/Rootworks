const rankOf = (s) => { s=String(s||'').trim(); if(['C-Suite','Founder','Owner','President','Executive'].includes(s)) return 1; if(s==='VP') return 2; if(s==='Head'||s==='Director') return 3; if(s==='Manager') return 4; return 5; };
const rows = $input.all().map(i => { const f=i.json.fields||i.json; return { key: f['Contact Key'], domain: String(f.Domain||'').toLowerCase(), sr: (f['Seniority Rank']!==undefined&&f['Seniority Rank']!==''&&!isNaN(Number(f['Seniority Rank'])))?Number(f['Seniority Rank']):rankOf(f.Seniority) }; });
const byDom={};
for(const r of rows){ if(!r.key) continue; (byDom[r.domain]=byDom[r.domain]||[]).push(r); }
const out=[];
for(const dom in byDom){ byDom[dom].sort((a,b)=>a.sr-b.sr).forEach((r,idx)=> out.push({ json:{ 'Contact Key': r.key, RankInCompany: idx+1 } })); }
return out;