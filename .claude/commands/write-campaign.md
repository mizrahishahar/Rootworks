# write-campaign

Write the sequence for one campaign, off a playbook.

Loads `cold-email-copywriter` (its `offers.md` first, then its `playbooks/`) for email, `linkedin-setter` for LinkedIn, `no-ai-slop` always. Read the client's KB rows (`product`, `asset`, `overrides`) before writing a word; a claim that is not in a `Verified` KB row is not a claim you may make.

## Before writing

- **Pick the playbook and say which**, and what it requires. The playbook decides the shape; the offer decides the argument.
- **Know the segment.** What can this copy say that a neighbouring segment's cannot? If nothing, the segmentation is wrong, not the copy.
- **The assets you reference must exist.** A link you promise ("I can send a video") has to be a real `asset` row. Promising something we cannot send is the worst outcome of a good email.

## Writing

- Copy only. No spintax (that is `spintax`), no mechanics, no variable syntax beyond the tokens the copy genuinely needs.
- Follow-ups thread under the first email; no new subject.
- Numbers come verbatim from `Verified` KB rows. If two sources disagree, stop and ask, and do not average them.
- Every option you offer the Operator gets rendered inside its full sentence, never as a bare fragment.

## Done when

The full sequence is shown in chat for approval, each touch labelled, with the playbook named and every number's source stated. Nothing is deployed here.
