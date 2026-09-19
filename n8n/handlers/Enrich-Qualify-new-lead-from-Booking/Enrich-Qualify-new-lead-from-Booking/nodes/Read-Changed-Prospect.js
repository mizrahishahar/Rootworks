// The prospect behind a cancelled/rescheduled meeting: what the call-nudge gate and the wake reason need.
let r=null; try{ r=$input.first().json; }catch(e){}
const f=(r&&(r.fields||r))||{};
const s=(v)=>String(v==null?'':(Array.isArray(v)?v[0]:v)).trim();
const clientLink=Array.isArray(f['Client'])?f['Client']:[];
return [{ json:{ prospectId:(r&&r.id)||'', phone:s(f['Contact Phone']), threadTs:s(f['BDR Thread TS']), timezone:s(f['Timezone']), clientId:clientLink[0]||'' } }];
