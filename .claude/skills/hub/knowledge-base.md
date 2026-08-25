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

## Source and steer are different things

A `product` row carries the client's own material: their page, their deck, their words. It never carries our recommendation about what outreach should lead with. Write one in and every later session reads an opinion as the client's instruction, with the Verified box appearing to vouch for it (Verified speaks only to numbers).

Our reads, angles and rulings live where they are owned, dated and attributed: a voice ruling in the onboarding form's voice notes or in overrides, a working note in intel. The only thing we add to a product row is provenance: what this is, where it came from, and what it is not evidence of.

Paid for on Dave.io, 2026-08-25: one session's line, "the flagship pain is the overnight incident", sat inside a Verified product row and steered every copy and inbox run toward an angle the client had rejected repeatedly.

## Repair the words, never stack a ban on top

When the KB keeps producing something the client rejects, find the sentences generating it and change those. A prohibition added to overrides while the contradicting text stays put leaves two instructions in the KB, and the one nearest the drafting context tends to win.

Prefer demotion to deletion. Most rejected angles are rejected as the lead, not as a fact. Say where it may still appear, a supporting line or one factor among several in qualification, instead of scrubbing it; otherwise the next session rediscovers it in the source material and promotes it back to the front.
