Teaches: the client knowledge base, why it decides fulfillment quality, and what each file type carries.

# The client knowledge base

KB Files is where a client actually lives: one row per document, retrieved by Client + Type. Every session that writes copy, works an inbox, builds a list, or qualifies a reply is only as good as these rows. **When reality changes and the KB does not, every future run fulfills against a client that no longer exists.** Maintaining it is not admin; it is the work.

## How it works

- **Text in cells, never attachments.** Attachments are for human-sent deliverables in Drive; the machine reads cells. A document that outgrows its cell splits into part rows sharing the Name.
- **Retrieval is Client + Type.** Sessions pull the rows a job needs, never the whole KB.
- **The Verified law.** Verified checked = the numbers in this doc are confirmed with the client and usable verbatim in copy. Unchecked = every number in it is unconfirmed. Checking the box is a claim about the client's sign-off, never a convenience.
- **Rich text mangles on write.** Airtable normalizes markdown and escapes underscores; machine readers must unescape (the intakes do).

## The types

| Type | Carries |
|---|---|
| `onboarding-form` | What the client told us at intake, raw |
| `overrides` | How this client differs from the default, across every job. **Exactly one per client.** Read before touching their outbound, always |
| `Inbox-Agent-Prompt` | How this client's reply agent behaves: reply shape, what never gets said, what gets sent when, scheduling behavior. **Exactly one per client**, read by the inbox and LinkedIn routines together with overrides |
| `qualification-prompt` | The client's ICP rubric. **Read LIVE by the reply intakes** as the qualifier's system prompt, so an edit here changes qualification on the very next reply |
| `product` | The client's product and offer knowledge, deep enough to write on their behalf |
| `research` | What we dug up: market, competitors, angles |
| `intel` | Working knowledge that fits nowhere else |
| `asset` | A thing we send: the row's Link is the live URL, Content holds the full text behind it so a session can read what the prospect will see without fetching. An asset promised in copy must exist as one of these rows |
| `inbox-manager-prompt`, `linkedin-setter-prompt` | Mirrors of the live routine prompts. The routine config is the live copy; edit there, mirror here |

## Placing new knowledge

New information about a client lands in the row whose type answers "who needs this, doing what": a rule for the reply agent goes in Inbox-Agent-Prompt, a delta from the default in overrides, a new number in its product or asset row (Verified only once confirmed), a change in who qualifies in qualification-prompt. Update the existing row over creating a sibling; delete what turned out wrong. Date the entries that will age, the way the existing rows do.
