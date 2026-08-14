const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'verifying',color:'blueBright'},{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const SRC=[{name:'P0',color:'blueBright'},{name:'P1',color:'cyanBright'},{name:'P2',color:'tealBright'},{name:'P3',color:'purpleBright'},{name:'none',color:'grayBright'}];
const ST=[{name:'done',color:'greenBright'},{name:'verifying',color:'blueBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}];
const sel=(name,choices)=>({name,type:'singleSelect',options:{choices}});
const txt=(name)=>({name,type:'singleLineText'});
// 2026-08-12: no bare 'MV' - P0 is the pre-existing-address tier, so a verify-only pass writes MV P0,
// the same column the waterfall uses. 'Email Source' replaces 'Source' (Operator ruling: Email Source =
// which tier found the email; Contact Source = where the contact came from, owned by the builders).
// SRC carries P3 so this array stays byte-identical to Waterfall Emails' Field List.
const defs=[ sel('MV P0',MV), sel('BB',BB), txt('Final Email'), sel('Email Source',SRC), sel('Status',ST) ];
return defs.map(d=>({json:{def:d}}));