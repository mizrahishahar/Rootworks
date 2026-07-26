---
vertical: [analysis, inbox-management]
type: infrastructure
owner: Operator
---

# Slack

The client channel and the internal comms surface. Positive replies and their threads surface here for the client; the inbox run reads and posts updates.

## Actions (MCP)
- **Read:** channel history and thread replies, to catch what the client said and reconcile a lead's live thread.
- **Post:** a message or a threaded reply (a client update, a booked-call notice) - always behind the draft-and-ask gate. 

The `Thread ID` (a message ts) stored on the Prospect row in the Hub ([[flowroots-hub]]) ties a lead to its Slack thread; the moveplnr sync posts BDR call updates from Slack onto that row as record comments. Never post to a client channel without approval.
