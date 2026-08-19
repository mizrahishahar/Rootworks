---
name: plusvibe
type: skill
vertical: [infrastructure, email]
description: Everything about PlusVibe, the email sender. Campaigns, the deployment standard, sequences and spintax on the platform, schedules, inboxes and limits, leads, variables, stats, the inbox, and every gotcha paid for. Use for any deploy, redeploy, edit, read, or question that touches PlusVibe.
---

# PlusVibe

The main email sender we use. One workspace per client; the workspace id lives on the client's registry row, and nothing platform-side is ever hardcoded per client.

**You operate this platform yourself, through its MCP, and the MCP is reliable for it.** Reading campaigns, building them, editing sequences and schedules, managing inboxes and tags, pulling stats, working mail: all of it is yours to do directly. The exceptions where the Operator's hands are needed are named where they occur.

## The laws here

- **Draft, show, wait.** Campaign settings are shown for approval before building (they often get changed), campaigns are built as drafts, and the Operator flips them live. Nothing launches unasked, nothing sends toward a prospect without an approved draft.
- **Read-backs are the only proof.** The API returns success while silently dropping settings, accounts, and leads. After any write, read the object back and confirm what actually landed: sequence, variables, schedule, accounts, enrolled counts. Never trust the success response.
- **On any MCP error, stop and ask the Operator to refresh.** Never retry in a loop.
- **The copy is not invented here.** Whatever the approved deploy-ready sequence says is what sends; the sender never edits words.

## This folder

Every file opens with a line saying what it teaches. `deployment-standard.md` is the house standard any campaign on the platform is held to, whatever the job that touches it. `platform.md` is how to operate the machine and the traps it has already cost us.
