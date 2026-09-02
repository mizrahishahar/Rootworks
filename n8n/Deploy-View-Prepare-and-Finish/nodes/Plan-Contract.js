// Plan Contract: THE RULE. The view's visible columns are the merge contract: every visible
// column is a variable and a row with an empty one is skipped. Three exceptions, in order:
// MACHINE columns are never read and never sent (the register's machine fields: the email lane,
// the Campaigns link and the sync's fields, the relevance and identity formulas, the contact
// provenance, the contact-pull stamps; taken from the field register the push inlines as REGISTER
// at the @@register line, every name checked against it so the list cannot drift); IDENTITY
// columns become the lead itself, never a variable; IGNORE columns ride along when filled and
// never block. A column on the table that is not on the register is the Operator's and deploys
// as a variable like any other visible column.
// The two lanes differ only in what identity is and in which columns never block: PlusVibe's
// identity is the email plus a first name and a company, and it also enforces the standard lead
// fields (State, City, Country) when the view shows them; Alta's identity is the LinkedIn URL
// plus a company, and the name rides along because Alta resolves the person from the URL.
// PlusVibe also refuses here, before a single lead is sent, when the source table lacks a column
// this door writes back: a client base is set up once, by the scaffold, and no working machine
// creates a column (Operator ruling 2026-09-02). The throw fails this sub-workflow, and with it
// the door that called it, which is where the Failed row belongs.
// @@register
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const shape = () => ({ ok: !D.abort, crBase: D.crBase || 'appMISSING', tableId: D.tableId || '', mirrorTableId: D.mirrorTableId || 'tblMISSING', target: D.target || '', view: D.viewId || D.view || '', dncTableId: D.dncTableId || '' });
if (D.abort) { return [{ json: shape() }]; }
const isPV = D.sender === 'PlusVibe';
// The machine fields, by group as the register declares them (ruling 2026-09-02). Each name must
// exist on the register, or the push is wrong.
const MACHINE_GROUPS = {
  lane: ['MV P0', 'P1 (Trykitt)', 'MV P1', 'P2 (LeadMagic)', 'MV P2', 'P3 (Prospeo)', 'MV P3', 'BB', 'Final Email', 'Email Source', 'Status'],
  campaign: ['Campaigns', 'Messages Sent', 'Last Contacted', 'Campaign Status', 'Bounce Reason', 'Synced At', 'Deploy Error'],
  formulas: ['manually_approved', 'relevance', 'linkedin_name_match', 'Build Date'],
  provenance: ['Contact Key', 'Contact Source', 'Source ID'],
  pull: ['Contacts Pulled At', 'Contacts Count', 'Contact Sources']
};
const regNames = new Set(); for (const T of (REGISTER.tables || [])) for (const f of (T.fields || [])) regNames.add(f.name);
const MACHINE = new Set();
for (const g of Object.keys(MACHINE_GROUPS)) for (const n of MACHINE_GROUPS[g]) { if (!regNames.has(n)) throw new Error('Plan Contract: the field register has no machine field "' + n + '" (' + g + '); fix the register or this list'); MACHINE.add(n); }
// PlusVibe's write-back columns must already exist on the source table.
if (isPV) {
  const want = String(D.tableName || D.table || '').trim().toLowerCase();
  const T = REGISTER.tables.find(x => String(x.name).toLowerCase() === want) || REGISTER.tables.find(x => x.name === 'People');
  const NEEDS = ['Deploy Error'].concat(D.mirrorTableId ? ['Campaigns'] : []).map(n => { const f = T.fields.find(x => x.name === n); if (!f) throw new Error('Plan Contract: the register has no field "' + n + '" on ' + T.name); return f.name; });
  const have = new Set(D.fieldNames || []);
  const missing = NEEDS.filter(n => !have.has(n));
  if (missing.length) {
    const msg = 'Table "' + (D.tableName || D.tableId) + '" (' + D.tableId + ') in base ' + D.crBase + ' is missing the columns ' + D.automation + ' writes: ' + missing.join(', ') + '. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.';
    sd[dk] = null;
    throw new Error(msg);
  }
}
const IGNORE_PV = new Set(['last_name', 'Title', 'Social', 'Phone', 'MX Provider', 'MX provider', 'MX', 'Seniority', 'Department', 'Existing In Role', 'ICP Reason', 'Description', 'Industry Groups', 'Employees', 'Revenue Range', 'Keywords', 'Company Status', 'Company City', 'Company State', 'Phones', 'Public Emails', 'Social URLs', 'Email Pattern', 'Signal Detail', 'detected_at', 'LinkedIn URL']);
const IGNORE_ALTA = new Set(['last_name', 'Title', 'Social', 'Phone', 'MX Provider', 'MX provider', 'MX', 'LinkedIn URL', 'City', 'State', 'State Full', 'Country', 'Zip', 'Street', 'Seniority', 'Department', 'Existing In Role', 'ICP Reason', 'Description', 'Industry Groups', 'Employees', 'Revenue Range', 'Score', 'Keywords', 'Company Status', 'Start Date', 'Company City', 'Company State', 'Phones', 'Public Emails', 'Social URLs', 'Redirect Domain', 'Email Pattern', 'Signal Detail', 'detected_at']);
const IDENTITY_PV = new Set(['Final Email', 'first_name', 'first_name_he', 'company_clean', 'Company']);
const IDENTITY_ALTA = new Set(['first_name', 'Company', 'company_clean']);
const CORE_LEAD = new Set(['State', 'City', 'Country']);
const IGNORE = isPV ? IGNORE_PV : IGNORE_ALTA;
const IDENTITY = isPV ? IDENTITY_PV : IDENTITY_ALTA;
const snake = k => String(k).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
let vm = {};
try { vm = ($input.first() || {}).json || {}; } catch (e) {}
const visible = Array.isArray(vm.visibleFieldIds) ? vm.visibleFieldIds : null;
const varCols = []; const rideCols = []; const requiredCore = [];
let needFirstName = isPV;
if (visible) {
  needFirstName = false;
  for (const fid of visible) {
    const name = D.fieldsById[fid]; if (!name) continue;
    if (name === 'first_name' || name === 'first_name_he') needFirstName = true;
    if (MACHINE.has(name) || IDENTITY.has(name)) continue;
    if (IGNORE.has(name) || /^job\s/i.test(String(name))) {
      // Alta reads its own identity off two of these; they never ride as variables there.
      if (!isPV && (name === 'LinkedIn URL' || name === 'last_name')) continue;
      rideCols.push({ name: name, key: snake(name) });
      continue;
    }
    if (isPV && CORE_LEAD.has(name)) { requiredCore.push(name); continue; }
    varCols.push({ name: name, key: snake(name) });
  }
} else {
  let why = 'view metadata unavailable';
  if (D.viewType && D.viewType !== 'grid') why = 'view "' + D.view + '" is type ' + D.viewType + ', not grid';
  else if (vm && vm.error) why = 'view metadata call failed: ' + JSON.stringify(vm.error).slice(0, 150);
  D.warnings.push(why + '; visibility unknown, so only identity fields are enforced and no custom variables are sent');
}
D.plan = { varCols, rideCols };
D.requiredCore = requiredCore;
D.needFirstName = needFirstName;
if (isPV && !needFirstName && visible) D.warnings.push('view "' + D.view + '" does not show first_name; the first name is not enforced and leads deploy without one');
if (!D.hasDeployError) D.warnings.push('table has no Deploy Error field; skip reasons are not written to rows');
D.fieldsById = null; D.fieldNames = null;
return [{ json: shape() }];
