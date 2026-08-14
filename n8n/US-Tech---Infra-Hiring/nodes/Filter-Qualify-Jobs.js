let items = $('Get Scraped Jobs').all().map(i => i.json);
if (items.length === 1 && Array.isArray(items[0])) items = items[0];
const worked = new Set($('Get Worked Domains').all().map(i => { const j = i.json || {}; const d = (j.fields && j.fields.Domain) || j.Domain || ''; return String(d).toLowerCase().trim(); }).filter(Boolean));
const badName = ['staffing','recruit','headhunt','talent acquisition','executive search','sourcer','consulting','outsourcing'];
const badIndustry = ['staffing','recruiting','executive search','venture capital','private equity','venture'];
function has(s, list){ s = String(s || '').toLowerCase(); return list.some(w => s.includes(w)); }
const seen = new Set();
const out = [];
for (const j of items) {
  const country = (j.companyAddress && j.companyAddress.addressCountry) || '';
  if (country && country !== 'US') continue;
  if (has(j.companyName, badName) || has(j.jobPosterTitle, badName)) continue;
  if (has(j.industries, badIndustry)) continue;
  const emp = Number(j.companyEmployeesCount || 0);
  if (emp && emp > 200) continue;
  let domain = String(j.companyWebsite || '').toLowerCase().replace('https://','').replace('http://','').replace('www.','').split('/')[0].trim();
  if (!domain) continue;
  if (seen.has(domain)) continue;
  if (worked.has(domain)) continue;
  seen.add(domain);
  out.push({ json: { domain, company: j.companyName || '', headcount: emp, country: country || 'US', job_title: j.title || '', job_link: j.link || '', posted_at: j.postedAt || '' } });
}
return out;