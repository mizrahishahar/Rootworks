const j=$input.first().json||{};
const body=j.body||{};
const arr=(body.data||[]);
return [{ json: { status: j.statusCode, count: arr.length, firstLead: (arr[0]||{}).lead||'', bodyKeys: Object.keys(body).join('/'), errSnippet: typeof body==='object'?JSON.stringify(body).slice(0,200):String(j.body).slice(0,200) } }];