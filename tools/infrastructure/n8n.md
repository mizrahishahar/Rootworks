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
- **Clone per client:** the standing flows are cloned from a template and bound to the client channels; do it from the recipe in the owning tool or skill, not from stored JSON.

## What lives here

- **List-building** (owned by the ClayRoots tool): the waterfalls.
- **Per-client standing flows:** reply-notify to the client Slack, meeting-sync, Slack-to-logs, and the qualify-and-notify new-lead flow. One set per client, named `... for {client}`.

## Conventions

- httpRequest node is typeVersion `4.4`. Generic (httpBasicAuth) credentials cannot be attached over the MCP - a human clicks each node once.
- Every workflow routes failures to the shared `Error Logger`.
- Name per-client flows `{purpose} for {client}`; keep the ID out of the vault, the name and the client variable are enough.