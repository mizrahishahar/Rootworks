const out = [];
const items = $input.all();
for (let i = 0; i < items.length; i++) {
  const rec = items[i].json;
  const f = (rec && rec.fields) ? rec.fields : rec;
  const url = String(f['Target Campaign'] || '').trim();
  if (!/^https?:\/\//i.test(url)) { continue; }
  const email = String(f['Final Email'] || f['Email'] || '').trim();
  const linkedinUrl = String(f['LinkedIn URL'] || '').trim();
  if (!email && !linkedinUrl) { continue; }
  const dom = String(f['Domain'] || '').trim();
  const body = {
    firstName: f['first_name'] || '',
    lastName: f['last_name'] || '',
    company: f['Company'] || '',
    extraInfoData: {
      'Source': 'Trigify',
      'Signal': f['Event Type'] || '',
      'Signal Detail': f['Signal Detail'] || '',
      'Sourced At': f['detected_at'] || ''
    }
  };
  if (dom) body.companyWebsite = /^https?:\/\//i.test(dom) ? dom : 'https://' + dom;
  if (email) body.email = email;
  if (linkedinUrl) body.linkedinUrl = linkedinUrl;
  out.push({ json: { recordId: rec.id || '', domain: dom, company: f['Company'] || '', altaWebhookUrl: url, altaBody: body }, pairedItem: { item: i } });
}
// Run 1618 worked top-down and Alta cut it off after ~130, so the leads still
// missing are the TAIL. Reverse so the unsent ones get the rate budget first.
out.reverse();
return out;