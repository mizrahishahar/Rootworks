const g = $('Launch Guard').first().json;
const baseId = ((g['Clayroots Base ID'])||'').trim();
const resp = $('AT List Tables').first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + baseId + ' to verify the Domains table.'); }
const target = tables.find(t => t.id === g.domainsTableId);
if (!target) { throw new Error('Domains Table ID ' + g.domainsTableId + ' does not exist in base ' + baseId + '. Nothing was pulled.'); }
if (!/domains/i.test(String(target.name || ''))) { throw new Error("Table '" + target.name + "' (" + target.id + ") does not look like a Domains table (name must contain 'domains'). Refusing to read company data from it - on purpose, so we never guess the wrong source of truth again. Nothing was pulled."); }
return [{ json: { domainsTableId: target.id, domainsTableName: target.name } }];