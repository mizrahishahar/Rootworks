# N8N-SCHEMA

What a machine is, the six types there are, where each lives, and the one card that declares it. This changes rarely.

A machine is one or more n8n workflows doing one job. Every machine is one of six types, sits in that type's folder, and carries one card. A workflow with no card does not exist: the push refuses it, the pull flags it.

## Types

| Type | Definition | Folder |
|---|---|---|
| Rootflow | adds to a client base | `n8n/rootflows/` |
| Deploy | moves rows from a view into a sender and stamps them so they are not moved twice | `n8n/deploys/` |
| Handler | one event from outside, one lead moved | `n8n/handlers/` |
| Manager | reads state on a schedule, reports to Slack, changes only what its permissions allow | `n8n/managers/` |
| Helper | called by the others, no run of its own | `n8n/helpers/` |
| Add-on | fired by a standard machine at a hook, one more thing | `n8n/addons/` |

Off is `n8n/archive/`. Not a type.

## The tree

```
n8n/
  <type>/
    <Machine>/
      card.json
      <Workflow>/
        workflow.json
        nodes/*.js
  archive/
  INDEX.md
```

One folder per machine, one subfolder per workflow, the card beside them. A machine with one workflow still has the folder and the card. `INDEX.md` is generated from the cards and the webhook nodes: machine, type, door, description.

## The card

```json
{
  "name": "Enrich Contacts",
  "type": "rootflow",
  "workflows": { "PLTNYqqoYfrt9ypd": "Enrich Contacts", "WG46cPFf6jx91aVq": "Enrich Contacts Chunk", "rc2IqbRdeTHjLP6F": "Enrich Contacts Writer" },
  "writes": "People, Companies",
  "description": "Finds people for every company in a Companies view from Blitz, GetLeads, QuickEnrich and Supersoniq, writes them into People linked to their company, then hands Not Waterfalled to Enrich Emails."
}
```

Four fields on every card: `name`, `type`, `workflows`, `description`. One more, by type:

| Type | Field | Says |
|---|---|---|
| rootflow | `writes` | the tables it adds to |
| deploy | `sender` | where the rows go |
| handler | `event` | what wakes it |
| manager | `may_change` | its permissions |
| helper | `called_by` | who calls it |
| addon | `hook` | what fires it |

Nothing the code already says goes on the card. The card is the approval: written after the Operator said yes in chat, with the machine's name, and the push creates the workflows only when it exists.

## Laws every machine keeps

- **One Hub row per run**, on the Automations table, Status computed, never a literal Failed (the Error Logger writes Failed). A helper writes no row; its outcome rolls into its caller's.
- **A launched machine reads its launch row and refuses a bad one on the row**, before any paid call. A scheduled machine also carries an on-demand door.
- **No execution grows with the list.** A loop over a list of unknown size calls a child per pass and keeps counters.
- **A new workflow is never a side effect of a task.** A card, after a yes.
- **Publish nothing while a run is in flight.**

## Supported senders

A sender is supported when it has a Deploy, a Handler, a line in the Campaigns Manager, and Get Availability if it books. PlusVibe, Alta, Email Bison.
