// One item per Apify dataset to fetch. Zero datasets still emits a placeholder so the chain
// reaches Build Writes (Signal Detail parsing needs no dataset).
const cfg=$('Parse Launch').first().json;
const ids=cfg.datasetIds||[];
if(!ids.length) return [{ json: { _empty:true } }];
return ids.map(id=>({ json: { datasetId:id } }));
