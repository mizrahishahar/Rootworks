// Launch Params: the launch row is the whole contract. Client link resolves the base,
// Query ID names the saved DiscoLike query, Tag is stamped on every row landed.
// Any missing piece stops the run here, before a single paid call.
const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const clientRecId=((f['Client']||[])[0])||'';
const queryId=((f['Query ID']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
if(!clientRecId){ throw new Error('Launch record '+rec.id+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Client on launch record '+rec.id+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)){ throw new Error('Query ID "'+queryId+'" is not a saved DiscoLike query id (uuid). Save the query in DiscoLike first. Nothing was pulled.'); }
return [{ json: {
  base: base,
  clientRecId: clientRecId,
  queryId: queryId,
  tag: tag,
  _launchRecordId: rec.id,
  startedAt: new Date().toISOString()
} }];
