---
name: alta
type: skill
vertical: [platform, linkedin]
description: Alta, the AI-SDR sequencer and LinkedIn inbox. What it is for us, how it is reached, and the lessons it has already cost us. Use before any read, reply, enrollment, pause or question that touches Alta.
---

# Alta

AI-SDR sequencer and inbox, LinkedIn-first with intent email on the side. For us it is a sequencer and an inbox, never a sourcing tool: leads arrive from n8n, Alta sequences them, every reply comes back to be worked by hand.

| Owns | Does not own |
|---|---|
| sending the sequence | sourcing, that is the Rootflows |
| holding every LinkedIn conversation | CRM truth, that is the Hub |
| the client's real LinkedIn accounts and their limits | primary email, that is PlusVibe |
| global opt-out suppression | |

## Access

- Sessions: the Alta MCP. `list_*` / `get_*` to read, `send_linkedin_message` / `send_email_message` to reply, `assign_tags`, `*_communication_opt_outs`, `pause_*` / `resume_*`, `ask_alta_agent` for numbers.
- n8n: REST at `https://api.altahq.com/v1`, bearer token from Account Settings. The public API has no stats or messages; those go through the MCP-over-HTTP path with the OAuth tokens in the `alta_oauth` data table.
- Campaigns are built and edited in the UI. The MCP can create and launch one but cannot read or write sequence copy.

## Where the rest lives

- What a campaign must carry, on any sender: [[campaigns]]
- How to write, judge and launch a sequence: `cold-email-copywriter`
- How to work a LinkedIn conversation: `linkedin-setter`
- What the fleet must look like: [[infrastructure]]

## The one law that is a fact about this platform

**Never trust a person record without the thread text.** Names, companies and employers come back stale; nothing from a record is merged into a message unverified.

## This folder

`lessons.md`: the surface by job, then every trap paid for, dated. Read it before touching the platform. When a lesson stops being true, delete it.
