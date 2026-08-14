const out = [];
const items = $input.all();

for (let i = 0; i < items.length; i++) {
  try {
    const rec = items[i].json;
    const f = (rec && rec.fields) ? rec.fields : rec;

    const url = String(f['Target Campaign'] || '').trim();
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('Target Campaign is not a valid Alta webhook URL: \'' + url + '\'.');
    }

    const email = String(f['Final Email'] || f['Email'] || f['email'] || '').trim();
    const linkedinUrl = String(f['LinkedIn URL'] || f['linkedin_url'] || '').trim();
    if (!email && !linkedinUrl) {
      throw new Error('Lead has neither email nor LinkedIn URL; cannot enroll to Alta.');
    }

    const dom = String(f['Domain'] || '').trim();
    const companyWebsite = dom ? (/^https?:\/\//i.test(dom) ? dom : 'https://' + dom) : '';

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
    if (companyWebsite) body.companyWebsite = companyWebsite;
    if (email) body.email = email;
    if (linkedinUrl) body.linkedinUrl = linkedinUrl;

    out.push({ json: { altaWebhookUrl: url, altaBody: body, recordId: rec.id || '' }, pairedItem: { item: i } });
  } catch (e) {
    // skip this record only — do not throw, so the rest of the batch still enrolls
  }
}

return out;