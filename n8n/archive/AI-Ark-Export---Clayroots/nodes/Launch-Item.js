const params=$('Launch Params').first().json;
const bin=$input.first().binary||{};
const data=bin.data||Object.values(bin)[0];
if(!data){ throw new Error('Download CSV returned no binary data.'); }
return [{ json: params, binary: { 'AI-Ark_contacts_CSV': data } }];