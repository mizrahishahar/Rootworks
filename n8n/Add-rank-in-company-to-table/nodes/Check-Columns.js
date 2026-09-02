// Check Columns: the column this machine writes must already exist on the table (Operator
// ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine creates a
// column). RankInCompany is an Operator column on People (Field Standard): the Operator adds it
// once, this machine only fills it. Reads the schema Table Guard already read, diffs by exact
// name, and refuses before a single row is read.
const NEEDS = ['RankInCompany'];
const g = $('Table Guard').first().json;
const have = new Set(g.fieldNames || []);
const missing = NEEDS.filter(function (n) { return !have.has(n); });
if (missing.length) { throw new Error('Table "' + g.tableName + '" (' + g.tableId + ') in base ' + g.baseId + ' is missing the columns Add rank in company to table writes: ' + missing.join(', ') + '. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
const out = Object.assign({}, g); delete out.fieldNames;
return [{ json: out }];
