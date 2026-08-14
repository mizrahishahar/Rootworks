const n=$('Normalize').first().json;
if(!n.is_contact || n.is_freemail){return [{ json: { contact_phone:'', contact_seniority:'', contact_title:'', contact_summary:'' } }];}
const r=$input.first().json||{};
let contact=null;const res=r.results||{};
for(const dk of Object.keys(res)){const c=res[dk];const arr=Array.isArray(c)?c:(c.contacts||c.personas||[]);if(arr&&arr.length){contact=arr[0];break;}}
if(!contact&&Array.isArray(r.contacts)&&r.contacts.length)contact=r.contacts[0];
const phones=contact&&Array.isArray(contact.phone)?contact.phone:[];
const phoneStr=phones.length?((phones.find(p=>p.type==='mobile')||phones[0]).phone||''):'';
return [{ json: { contact_phone:phoneStr||'', contact_seniority:(contact&&contact.seniority)||'', contact_title:(contact&&contact.title)||'', contact_summary:(contact&&contact.summary)||'' } }];