# write-campaign

Write the sequence for a campaign, off a playbook.

Loads `cold-email-copywriter` (its `offers.md` first, then its `playbooks/`) for email, `linkedin-setter` for LinkedIn, `no-ai-slop` always. Read the client's KB rows (`product`, `asset`, `overrides`) before writing a word; a claim that is not in a `Verified` KB row is not a claim you may make.

$ARGUMENTS

## Before writing

- **Pick the playbook and say which**, and what it requires. The playbook decides the shape; the offer decides the argument.
- **Know the segment.** What can this copy say that a neighbouring segment's cannot? If nothing, the segmentation is wrong, not the copy.
- **The assets you reference must exist.** A link you promise ("I can send a video") has to be a real `asset` row. Promising something we cannot send is the worst outcome of a good email.
- If we are being asked. we look at past campaigns to understand better based on real data what we build today.

## Writing

- Copy only.
- Follow-ups thread under the first email; no new subject.
- Numbers come verbatim from `Verified` KB rows. If two sources disagree, stop and ask, and do not average them.
- Every option you offer the Operator gets rendered inside its full sentence, never as a bare fragment.

## How to show it

**Clean copy only.** No spintax, no signature, no sending mechanics - those belong to `spintax` and `deploy-to-plusvibe`. Placeholders are the real tokens the leads carry.

One heading per touch. Variant letter, any qualifier and the subject on the variant line, `·`-separated. Body as a blockquote. `---` between touches, never between variants.

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

Where one body runs against several subjects, stack the variant lines above the body they share and write the body once:

```
**Variant A**  ·  *body A*  ·  *Subject:* your cloud costs
**Variant C**  ·  *body A*  ·  *Subject:* {{first_name}} <> Sean

> the body, once
```

**Reprint the whole sequence on every refinement.** Never just the changed line. The Operator judges a sequence, not a diff, and a line that reads well alone can break the email around it.

**When offering alternatives for a line**, table them with a one-line read on each and mark the recommendation. Every option rendered inside its full sentence, never as a bare fragment:

```
| | Option |
|---|---|
| **1** ★ | ... |
| 2 | ... |
```

**After a revision**, close with a short table of what changed and why - one row per change. It is the only way the Operator can see the delta without diffing two long sequences by eye.

## Done when

The full sequence is shown in chat for approval, formatted as above, each touch labelled, with the playbook named and every number's source stated. Nothing is deployed here.
