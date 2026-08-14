const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const sel=(name,choices)=>({name,type:'singleSelect',options:{choices}});
const txt=(name)=>({name,type:'singleLineText'});
const defs=[ sel('MV',MV), sel('BB',BB), txt('Final Email'), sel('Status',[{name:'done',color:'greenBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}]) ];
return defs.map(d=>({json:{def:d}}));