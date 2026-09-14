---
name: plusvibe
type: skill
vertical: [platform, email]
description: PlusVibe, the main email sender. What it is for us, how it is reached, and the lessons it has already cost us. Use before any read, build, edit, deploy or inbox action on PlusVibe.
---

# PlusVibe

The main email sender. One workspace per client; the workspace id lives on the client's registry row, and nothing platform-side is ever hardcoded per client.

You operate it yourself through its MCP, and the MCP is the mechanics: what a setting is and how to set it is in the tool descriptions, not here. What is here is what the MCP will not tell you.

## Where the rest lives

- What a campaign must carry, on any sender: [[campaigns]]
- What the fleet must look like, on any provider: [[infrastructure]]
- How to write, judge and launch copy: `cold-email-copywriter`
- How to work a reply: `inbox-manager`

## The two laws that are facts about this platform

- **Read-backs are the only proof.** The API returns success while silently dropping settings, accounts and leads. After any write, read the object back and confirm what landed.
- **On any MCP error, stop and ask the Operator to refresh.** Never retry in a loop.

## This folder

`lessons.md`: the MCP surface by job, then every trap paid for, dated. Read it before touching the platform. When a lesson stops being true, delete it.
