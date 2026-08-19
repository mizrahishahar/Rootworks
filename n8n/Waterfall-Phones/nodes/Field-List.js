// Writeback columns. Emitted unconditionally; Airtable's duplicate-field error on
// Create Field is harmless (neverError), so a table that already has them just passes.
const txt = (name) => ({ name, type: 'singleLineText' });
const defs = [txt('Phone'), txt('Phone Source')];
return defs.map((d) => ({ json: { def: d } }));
