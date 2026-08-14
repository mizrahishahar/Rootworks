const accounts = $input.first().json.accounts || [];
const seen = {};
const repEmails = [];
for (const a of accounts) {
  const e = String(a.email || '');
  const at = e.indexOf('@');
  if (at < 0) continue;
  const d = e.slice(at+1).toLowerCase();
  if (!seen[d]) { seen[d] = true; repEmails.push(e); }
}
const ws = $('Loop Over Workspaces').item.json;
return [{ json: { workspace_id: ws.id, workspace_name: ws.name, accounts: accounts, rep_emails: repEmails } }];