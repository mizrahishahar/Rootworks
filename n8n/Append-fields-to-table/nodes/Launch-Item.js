const j=$('Launch Params').first().json;
const bin=$input.first().binary||{};
const key=bin['Domain_CSV'] ? 'Domain_CSV' : Object.keys(bin)[0];
if(!key){ throw new Error('Launch guard: CSV download returned no file. Nothing was written.'); }
return [{ json: j, binary: { Domain_CSV: bin[key] } }];