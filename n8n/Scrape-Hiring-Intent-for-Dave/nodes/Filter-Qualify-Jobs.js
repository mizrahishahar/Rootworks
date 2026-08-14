const items = $input.all().map(i => i.json);
const badName = /(\bstaffing\b|\brecruit|\bheadhunt|talent acquisition|executive search)/i;
const badPoster = /(recruit|talent acquisition|staffing|sourcer|headhunt)/i;
const badIndustry = /(staffing|recruiting|executive search)/i;
const seen = new Set();
const out = [];
for (const j of items) {
  const country = (j.companyAddress && j.companyAddress.addressCountry) || '';
  if (country && country !== 'US') continue;
  const name = j.companyName || '';
  const poster = j.jobPosterTitle || '';
  const industries = String(j.industries || '');
  if (badName.test(name) || badPoster.test(poster) || badIndustry.test(industries)) continue;
  let domain = String(j.companyWebsite || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase();
  if (!domain) continue;
  if (seen.has(domain)) continue;
  seen.add(domain);
  out.push({ json: { domain, company: name, headcount: j.companyEmployeesCount || '', country: country || 'US', job_title: j.title || '', job_link: j.link || '', posted_at: j.postedAt || '' } });
}
return out;