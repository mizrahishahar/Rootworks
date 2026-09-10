// Check Columns: every column this run writes must already exist on the target table (Operator
// ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine creates a
// column, and Append fields never creates one from a CSV header). The list is the launch's own:
// the CSV attribute columns, narrowed by Fields to attach, as Guard Schema mapped them onto the
// table's names. Diffs by exact name against the schema Guard Schema already read and refuses
// before a single row is touched.
const g=$('Guard Schema').first().json;
const have=new Set(g.fieldNames||[]);
const missing=(g.attrCols||[]).filter(c=>!have.has(c));
if(missing.length){ throw new Error('Table "'+g.tableName+'" ('+g.tableId+') in base '+g.baseId+' is missing the columns Append fields to table writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
return [{ json: { tableId: g.tableId, tableName: g.tableName, keyName: g.keyName, fieldsAppended: g.attrCols } }];
