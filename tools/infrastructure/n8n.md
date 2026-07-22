---
vertical: [list-building, inbox-management, analysis]
type: infrastructure
owner: Operator
---

# n8n

The automation platform: every pipe in Rootworks runs here - the list-building ingests and waterfalls, and each client standing flows (reply notify, meeting sync, Slack-to-logs). A skill reaches n8n over its MCP to inspect, clone, and configure workflows; it never hand-edits a live workflow unless asked.

## Actions

- **Read:** `search_workflows` to find one by name, `get_workflow_details` for its trigger and nodes, `search_executions` / `get_execution` to see a run.
- **Read a live form:** a form-triggered workflow declares its current fields in `get_workflow_details` trigger info; read them fresh each run instead of trusting a cached field list, since forms change.
- **Build:** read the SDK reference first, then `search_nodes` and `get_node_types` for exact params, `validate_workflow`, `create_workflow_from_code`, `publish_workflow`. Never guess node params.
- **Clone per client:** standing flows are cloned from the `[template]`-prefixed workflows. A clone carries exactly one hardcoded value - the client's record ID in the Hub Clients table (plus its own webhook path where the template names one). Every other client value (PV workspace, Slack channel, Drive folder, Close tag, qualification prompt) resolves from the registry row at runtime. Never rebuild from stored JSON.

## The standardized automation

Every automation meets one contract, on-demand and event-driven alike:

- **One run record in the Hub runs table ([[clayroots]]), and the record is the lifecycle:** Running, then Succeeded or Failed. On-demand runs are born from the Airtable creation form - the automation fires off the new record and reads every parameter, attachments included, from it. Event-driven flows create their own record at start, already stamped Running, which is also what keeps them out of the launcher lane.
- **The finish stamps the log on the same record:** counts in and out, credits, duration, Status, and the per-run Description.
- **Failure stamps too.** The shared `Error Logger` is every workflow's Error Workflow; a crash stamps Failed with the error on the run record and pings Slack. No run vanishes without a row.
- **The client is resolved from the registry, never hardcoded,** and artifacts land with the client: sheet outputs carry only what did not enter the base, into the client Reports folder.

## What lives here

- **List-building** (owned by the ClayRoots tool): the waterfalls.
- **Per-client standing flows:** reply-notify to the client Slack, meeting-sync, Slack-to-logs, and the qualify-and-notify new-lead flow. One set per client, named `... for {client}`.

## Conventions

- httpRequest node is typeVersion `4.4`. Generic (httpBasicAuth) credentials cannot be attached over the MCP - a human clicks each node once.
- **Every workflow names `Error Logger` as its Error Workflow** (workflow Settings -> Error workflow). The MCP cannot set this property, so it is a mandatory manual click when a workflow is created or cloned - a workflow without it does not ship. Set on the `[template]` workflows too, so clones inherit it.
- Name per-client flows `{purpose} for {client}`; keep the ID out of the vault, the name and the client variable are enough.
- PlusVibe calls in templated flows authenticate with the shared `Plusvibe Admin` credential and pass the client's `workspace_id` from the registry row - never a per-client credential.
- Lead state lives in Close, not in sender variables: the qualifier writes the verdict, brief, and opportunity to Close, and downstream flows gate off Close.
