Teaches: how a written sequence becomes a campaign on the sender, a row in the Hub, and a managed campaign, in the order that keeps nothing from being forgotten.

# Launching

Input: a client, a sender, a sequence (touches, waits, variants, subject lines, bodies, spintax in place). The sequence does not need to be final; the campaign is built as a draft and nothing sends until the Operator flips it live.

What the campaign must satisfy is [[campaigns]]. What the sender cannot do, or does wrong, is in that sender's skill; read it first.

1. **Settings, as a list.** Name in the standard's shape, the sequence shape, the inbox tag, the schedule, the flags. Shown before anything is built; the Operator changes them often.

2. **Build, as a draft.** On the sender, through its MCP. Where the sender's skill says a part cannot be built that way, hand the Operator that part and the settings list, and verify what was built.

3. **Read back.** Sequence, variables, schedule, accounts, flags, from the sender, against step 1. Anything that did not land is rebuilt. Not built until it matches.

4. **The Hub row.** Fire the sender's campaign sync so the row exists today. Match on the sender's campaign id, never duplicate.

5. **The record.** `Campaign Copy` on the row: the sequence as approved, before spintax, the way the client would read it. Whatever the sender's skill says the row must also carry for its feed, put there.

6. **Bind.** `Live View ID` to the segment view. `Stage` to Test.

7. **Hand it over.** Show the Operator the campaign as it reads back and the row as it stands. The Operator flips it live. From the next morning the manager feeds and judges it.

Done when: the read-back matches, the row exists with its copy and its view, Stage reads Test, and the campaign is a draft waiting for the flip.
