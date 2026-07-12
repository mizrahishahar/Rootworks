# Sender interface

Every sender tool presents the same surface, so a deployer skill can operate any of them without knowing which. You connect to the one the client runs on; the actions are the same. This is the point: swap the sender, not the skill.

## Properties
`type: sender` · `channel: email | linkedin | email+linkedin` · `owner` · `vertical`

## The shared actions

- **Deploy a campaign** — stand up a campaign from an approved sequence: create it, load the sequence and its waits, set the schedule and sending accounts, add the leads, launch.
- **Add leads** — push a lead list into a live campaign, deduped against what is already in the workspace.
- **Pull stats** — read the live numbers (sent, replies, positives, bookings) for analysis.
- **Manage** — pause, resume, adjust the daily limit, swap accounts, stop a lead.

Each sender's file gives the how for its own API. The deployer and analyzer skills call these verbs against whichever sender the client uses.
