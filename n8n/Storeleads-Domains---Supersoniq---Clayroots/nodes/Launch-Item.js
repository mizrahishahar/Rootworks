const items=$input.all();
const bin=(items[0]&&items[0].binary)||{};
const data=bin.data||Object.values(bin)[0];
if(!data){ throw new Error('Download CSV returned no binary data.'); }
return [{ json: $('Launch Params').first().json, binary: { Storeleads_domains_CSV: data } }];