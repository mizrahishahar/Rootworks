const f = $('Flatten').first().json;
let sig='', sigTf='';
try { const ft = $('Format Thread').first().json || {}; sig = String(ft.signature_phone || '').trim(); sigTf = String(ft.signature_phone_tollfree || '').trim(); } catch(e) {}
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g,''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const gpt = String(f.custom_phone || '').trim();
let mobile = '';
try { const cur = $input.first().json || {}; mobile = String(cur.mobile_number || '').trim(); } catch(e) {}
let phone = '';
let phone_source = 'none';
if (sig) { phone = sig; phone_source = 'signature'; }
else if (gpt && !isTollFree(gpt)) { phone = gpt; phone_source = 'GPT'; }
else if (mobile) { phone = mobile; phone_source = 'LeadMagic'; }
else if (f.custom_qualification_status === 'out_of_icp') { phone_source = 'skipped'; }
else if (sigTf) { phone = sigTf; phone_source = 'signature-tollfree'; }
else if (gpt) { phone = gpt; phone_source = 'GPT-tollfree'; }
return [{ json: { phone, phone_source } }];