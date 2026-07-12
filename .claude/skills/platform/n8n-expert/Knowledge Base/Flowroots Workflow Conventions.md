# Flowroots n8n Workflow Conventions

Standing rules for any workflow we build in the Flowroots n8n instance. Apply on creation, not retroactively.

---

## 1. Every workflow points at the Error Logger

In Workflow Settings → **Error Workflow** dropdown → pick **Error Logger** ([wQC0daVIMSs1gYVN](https://solutionsatoz.app.n8n.cloud/workflow/wQC0daVIMSs1gYVN)).

Failures auto-route to `#flowroots-n8n` with workflow name, failing node, error message, execution link. Set this **before adding any logic** — habit-driven, not an afterthought.

n8n cloud does not expose a global default error workflow (self-hosted feature only), so it must be set per workflow.

---

## 2. Webhook-triggered workflows redirect to the live execution page

Pattern for any workflow whose trigger is a Webhook (typically fired from an Airtable button field):

1. Webhook node → Settings → **Response Mode**: `Using Respond to Webhook Node`
2. Add a `Respond to Webhook` node **immediately** after the webhook:
   - **Respond With**: `Redirect`
   - **Redirect URL**: `https://solutionsatoz.app.n8n.cloud/workflow/{WORKFLOW_ID}/executions/{{ $execution.id }}`
   - **Response Code**: `302`
3. Continue the real workflow chain after the redirect node.

The user clicks the Airtable button → browser drops them straight into the live execution view instead of the "Workflow got started" plaintext. They can watch it run end-to-end.

Replace `{WORKFLOW_ID}` with the actual workflow ID at the time of building.

---

## 3. Airtable button → webhook is the canonical trigger for prospect actions

For any per-prospect operation (research, qualification, fulfillment, deck generation):

- Trigger lives as a **button field on the Airtable record**
- Button URL: `https://solutionsatoz.app.n8n.cloud/webhook/{path}?id={{ RECORD_ID() }}`
- Webhook reads `$json.query.id` and immediately fetches the full Airtable record via `Get Company Record`

This keeps the human in the Airtable view they already work from. No separate dashboards, no copy-pasting record IDs.

---

## 4. Halted-on-empty becomes a real error via Stop and Error

n8n treats `0 items returned` as a successful execution, so the chain halts silently and the Error Logger never fires.

For workflows where missing data IS a bug (not an expected empty state), add a `Stop and Error` node after the suspect upstream node with a custom error message. The execution becomes a real failure → Error Logger picks it up → Slack ping.

Use sparingly — only on the one or two "must have data" gates per workflow, not after every node.

---

## 5. New-workflow checklist

Before writing the first node of logic:

- [ ] Workflow Settings → Error Workflow = Error Logger
- [ ] If webhook-triggered → set responseMode to Respond Node + add redirect node
- [ ] If Airtable-triggered → add button field on the relevant Airtable table

These three take under a minute total and remove all retro-fitting work later.
