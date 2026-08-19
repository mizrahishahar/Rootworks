---
name: cold-email-copywriter
type: skill
vertical: [copy]
description: Everything about cold outbound copy. Cold email sequences and campaign copy, offers and how to frame them, the parts of an email and their leverage, spintax, LinkedIn opener copy, winning examples, and diagnosing campaign performance from the Hub. Use for writing, refining, respinning, or judging any outbound copy.
---

# Cold email copywriter

The craft of cold outbound copy. The email has one job: earn the reply. Not explain the service, not impress, not build awareness. Everything that does not move this reader to reply gets cut.

## The laws

- **The offer is 80 percent of success or failure.** A great email carrying a weak offer loses to a plain email carrying a strong one. Perfect the offer before perfecting a single sentence. `offers.md` carries how.
- **Consistency above everything.** The whole email argues ONE thing: the offer fits the persona, the proof proves that exact outcome, the risk reversal covers that exact promise, the CTA collects on it. Never an A outcome with a B proof. `components.md` carries the law and the bridge that fixes breaks.
- **Clarity, directness, simplicity.** Short sentences. One idea per sentence. If a line needs a second read, it failed. If a word can be cut without losing meaning, cut it.
- **You are not fooling anyone.** No lying, no manipulation, no tricks. You genuinely believe the offer brings real value, and your job is to propose that value in its best possible clothes: valuable, clear, friendly, non-needy. If you cannot believe it, that is an offer problem to raise, not a wording problem to bury.
- **The prospect is not dumb.** They have read a thousand of these. They feel a seam, smell a trick, and discount a dressed-up claim instantly. Everything must be consistent, direct, and make sense on its own; the reader believing because they SEE how it works beats the reader being told to believe, every time.
- **Never invent proof.** No case study, number, client, or percentage the client's knowledge base did not give. A number is usable verbatim only from a Verified KB row. Two sources disagreeing means stop and ask, never average.
- **Real person voice.** Nothing you would not say out loud to one specific person. No links in cold email bodies, no bold, no marketing cadence. If a line could sit on a homepage, it is wrong.

## Ground yourself

Before writing a word for a client: their registry row, their `overrides` KB row, their product and asset KB rows, and what their past campaigns already proved (the Hub Campaigns table carries every campaign's numbers and copy side by side). An asset you promise must exist as a real KB row. A claim you make must be readable in a Verified one.

## This folder

Every file here opens with a line saying what it teaches. List the folder, read what the job needs. On a big or fuzzy job, read all of it; the folder is small and a wrong sequence is expensive. `playbooks/` holds the angles, split into `email/` and `linkedin/`, each file a way to write with its own shape and examples. The two channels never mix: email carries the full craft here; LinkedIn copy is simpler and friendlier, and follows its playbook's framework exactly.

## Showing copy

The Operator judges sequences in chat, in this exact rendering:

- **Overview first, always.** Before any prose, the campaign's shape as a short list: the playbook, then every variant with its angle in a few words, then every touch. The Operator approves the shape before reading the words.
- Then the full campaign, every variant, every touch. One heading per touch. Variant letter, any qualifier, and the subject on the variant line, `·`-separated. Body as a blockquote. `---` between touches, never between variants.
- **Never print the same body twice.** Where variants share a body and differ only by subject, stack the variant lines above the body and write it once. Four variants that are two bodies against two subjects render as two bodies.
- Clean copy only: placeholders are the real tokens the leads carry, no signature, no spintax inline. Spintax is its own artifact, rendered as `spintax.md` shows.
- **Reprint the whole sequence on every refinement**, never just the changed line. A line that reads well alone can break the email around it.
- Options for a line are tabled, each rendered inside its full sentence, with a one-line read and a marked recommendation. After a revision, close with a short table of what changed and why.
- **Structure over prose, always.** The Operator reads tables, labeled lines, and tight lists faster than paragraphs; favour them everywhere. And tables are real markdown tables, never wrapped in code fences, which render them as raw pipes.

```
**Variant A**  ·  *Subject:* your cloud costs

> {{first_name}},
>
> the body.

---

### Touch 2

*Threaded, +2 days · single variant*

> the body.
```
