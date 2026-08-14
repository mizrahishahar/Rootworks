---
Type: Session Log
date: 2026-08-12
tags: [architecture, sops, commands, skills, retrospective]
---

# Atomic commands - retiring the SOP model

Written at the end of a two-and-a-half day Campaign run on Dave.io (2026-08-07 to 2026-08-12) that spanned two campaigns, a copy rewrite shipped live, a new campaign built from zero, a convention change, and the discovery of a list defect affecting roughly 38% of everything the client has ever sent. The Operator asked for the thinking to be written down rather than acted on. Nothing here has been built. This is a proposal and a retrospective, not a change.

---

## 1. The claim

The SOP layer should stop being an executor. Skills stay exactly as they are; they are the part of the system that works. What should replace SOPs is a set of **atomic commands** - one verb, one object, one artifact - that the Operator types unprompted, mid-conversation, in any order.

The SOP is a good description of how work flows. It is a bad program for running it.

---

## 2. The evidence, from this session

Four failure modes. Each is named with the moment in the run that produced it, not argued from theory.

### 2.1 The unit was too big

Every real request the Operator made in this run was a verb with one object:

- "could you pull off the copy"
- "change the 'if its real' line to something more practical"
- "show me all the spintax"
- "is this lead in PlusVibe? eric.durand@bioptimus.com"
- "I want alternatives for the word save"
- "message the session"
- "put the campaign copy back here"

Not one of those is a procedure. The SOP's unit is a fourteen-step run with declared owners and holds. The Operator never once wanted a run; they wanted a verb executed and the result shown. The ceremony around each verb - declaring the step, naming the owner, holding for the go - was pure overhead on every single one.

The cost is not just tokens. It is that a fourteen-step frame makes small asks feel like interruptions to a procedure, when in fact the small asks ARE the work.

### 2.2 The gates were in the wrong places

The SOP decides where to stop based on **who owns the step**. The correct basis is **what is expensive to undo**.

Two concrete errors in this run, in opposite directions:

- I held for approval on choosing an email playbook (SOP step 4, Operator-owned). The Operator did not care and it cost a round trip.
- I wrote operational metadata into the Hub `Campaign Copy` field - "Playbook: offer-led. Status: DRAFT, 0 leads, 14 SURBL-FREE inboxes" - without asking. That field is client-facing, conventions-manager explicitly says it carries only what the prospect reads, and the Operator was rightly annoyed. No gate existed there because the step was mine.

A gate belongs before an external write, always, and nowhere else. Reading is never gated. Drafting is never gated.

### 2.3 Context was re-derived instead of carried

Every SOP opens with a context step. That is right for a full run and wrong for everything else. When the Operator asked "is eric.durand@bioptimus.com in PlusVibe?", zero client context was needed - the answer was four API calls. Under the SOP frame, small questions inherit the cost of a full load, so they get avoided, so problems stay hidden.

### 2.4 It had nowhere to put discovery

This is the most expensive one.

The single most valuable thing that happened in this session was finding that **37-39% of every lead Dave.io has emailed was outside the ICP** - German, British, Indian, Swedish, Australian and Czech companies in a campaign scoped "B2B Tech US 1-50", plus a size-band leak and a stale `reloaded_patch` flag silently cutting qualified buyers (including Bioptimus's CTO).

That did not come from a step. It came from the Operator asking a one-line question about a single lead, mid-run, with no SOP step to hang it on. I had to bolt a handoff onto the end of a Campaign session log because there was no other place for it.

A system whose highest-value output arrives outside its own structure is telling you something about the structure.

---

## 3. My own failures in this run, stated plainly

These matter because a command design should be shaped to prevent them, not just to be tidier.

**Wrote spintax options without substituting them back into the sentence.** I offered `open to hearing more about it?` and `want me to send the details?` as options for a slot inside an "If we could ... would ..." conditional. Both produce broken English. The Operator caught it and said, correctly, that they no longer trusted me on spintax. The fix is not care, it is a contract: **an option is not an option until it has been rendered in its full sentence and read back.** That belongs in the command definition, not in my good intentions.

**Read a copy device as an instruction, five times.** The Operator wrote `(hint - it has human-backed agents)` repeatedly. It was the copy - a parenthetical aside to the reader. I read it as a note to me, every time, and kept producing flat sentences instead. Nothing in the system caused this; it was mine. But it is an argument for commands that take a literal target string rather than a paraphrased intent.

**Created a duplicate Hub row.** I hand-created a Campaigns row for a campaign the nightly PlusVibe sync had already discovered the day before. Two rows on one Campaign ID breaks the sync's upsert key. Found and deleted later in the session. A `/sync` or `/reconcile` command that checks before it writes would have made this impossible.

**Diagnosed copy without checking the denominator.** I told the Operator the feedback campaign's 0.2% reply rate was a copy fault - a demo CTA inside a feedback ask - and rewrote the sequence on that basis. It was only hours later, tracing an unrelated lead, that the 38% non-ICP denominator surfaced. The rewrite may still be right, but the diagnosis was made on a number I had not validated. **Count before you conclude** is already in list-builder's doctrine; it was not in my hands when I needed it.

**Flagged a broken CLI instead of just editing the file.** The obsidian CLI lost credentials mid-session. I reported it as a blocker. The Operator pointed out I was operating inside the vault and could simply edit the file. Correct. The rule "vault writes go through the CLI" is a consistency preference, and I treated it as a hard wall.

---

## 4. The split: commands versus skills

The Operator said they had not worked out the split. Proposed rule, and it is testable:

> **If you would type it mid-sentence, it is a command. If it is the reason the command knows what "good" means, it is a skill.**

| | Command | Skill |
|---|---|---|
| Who invokes it | The Operator, by name, unprompted | Never the Operator. The command loads it |
| Shape | One verb, one object, one artifact | Judgment, standards, doctrine |
| Varies per run | Yes - the target | No |
| Examples | `/line`, `/deploy`, `/trace` | `email-copywriter`, `views-poweruser`, `segmentor` |

Skills are already right. They are the part of this system that consistently produced good work in this run - `relevance.md` contained the exact rule that would have prevented the country leak ("Title alone misses company-level noise ... needs a company-level condition alongside the title one"), and `segmentation.md` contained the exact test that stopped a bad title split. The knowledge layer is sound. Only the executor layer is wrong.

### Three properties every command needs

1. **One artifact out.** If it produces two things, it is two commands.
2. **At most one gate, and only before an external write.** Sending, deploying, deleting, publishing. Nothing else.
3. **Answerable in one turn.** If it needs a conversation, it is a recipe, not a command.

---

## 5. The command set, mined from this session

Grouped by vertical. Each one is something that actually happened in this run, or something whose absence was felt.

### Copy - where roughly 80% of this session went

| Command | Takes | Returns |
|---|---|---|
| `/line` | a line, and what is wrong with it | 3-5 alternatives, **each substituted back into its full sentence and read**, with a one-line judgment on each |
| `/copy` | campaign, playbook, vars | a clean sequence, no mechanics, no spintax |
| `/spintax` | a sequence | slot table, 3 options per slot, every option substitution-checked |
| `/spamcheck` | any copy | flagged words plus swaps that preserve meaning |
| `/offer` | client | the offer table and a **viability verdict**, allowed to return "not runnable" |
| `/playbook` | the situation | which playbook fits, what it needs, what is missing |
| `/diagnose` | a campaign | why it underperforms, with the denominator validated before any copy claim |

`/line` was run informally about twenty times in this session and is by far the highest-frequency action. It is also where I failed hardest. Its contract - substitute before offering - is the single most valuable rule in this document.

`/diagnose` must refuse to blame copy until it has checked who was actually mailed. That is the direct lesson of the 0.2% misdiagnosis.

### Sender

| Command | Returns |
|---|---|
| `/pullcopy` | a live campaign's copy exactly as deployed, spintax intact |
| `/deploy` | copy pushed, then **read-back verified** - never trust the response code |
| `/campaign new` | a campaign shell on the client's standing defaults |
| `/gateway` | the gateway twin: identical copy, clean inbox set only |
| `/senders` | swap the inbox set on a campaign |
| `/launch` | readiness check with honest flags, then live |
| `/numbers` | live campaign stats for a client, judged against the bands |

`/pullcopy` was a literal Operator request in this run ("could you pull off the copy") and took several tool calls to satisfy. It should be one word.

### List - the vertical that actually failed the client

| Command | Returns |
|---|---|
| `/icp` | an ICP description shaped for the source's own query language |
| `/relevance` | the Relevant + Cut review pair, **company gate and title gate**, built and complement-verified |
| `/segments` | proposed segments with exact filters, each justified by what new thing the copy can say |
| `/count` | a distribution on any table plus filter. Free. Run before concluding anything |
| `/trace` | **why is this lead, or is not this lead, where it should be** - walks source, table, view, export, sender |
| `/table init` | a build table with the standard view chain |
| `/export` | a segment cut to CSV into its campaign folder |

`/trace` did not exist and is the reason everything was found. One question - "is this lead in PlusVibe?" - surfaced four defects: the `reloaded_patch` cut, the country leak, the size-band leak, and the IC-title admission. It is the highest-leverage command on this list and currently nobody's job.

`/count` is deceptively important. Every wrong conclusion I reached in this session came from not counting first.

`/relevance` must enforce two things the current filter does not: a company-level condition, and title matching on **seniority tokens** rather than **domain nouns**. The current view matches `Software`, `Data`, `Cloud`, `Platform`, `Tech` - words every individual contributor carries. It should match `Founder`, `Chief`, `CTO`, `VP`, `Head`, `Director`, `Owner`, `President`, `Principal`. A domain noun may rank a row; it must never admit one.

### Infrastructure - the "we need that" list

| Command | Returns |
|---|---|
| `/debug` | last N runs of an automation, the failing node, the real payload, the fault named |
| `/restart` | re-run on a target, using the correct trigger method |
| `/wire` | connect a webhook, trigger or table into the machine |
| `/reconcile` | find and fix duplicate or orphaned records against their upsert key |

`/reconcile` comes straight from the duplicate Hub row I created.

`/debug` matters more than its position here suggests: the Outreach State Sync has been unbuilt since 2026-08-03, and until it exists every export inherits a stale snapshot that silently cuts qualified buyers.

### Records

| Command | Returns |
|---|---|
| `/sync` | push current copy to **vault + Hub + sender**, and assert all three are identical |
| `/log` | the session log to Hub SESSIONS |
| `/handoff` | a self-contained brief, written to the log **and** delivered to the target session |
| `/convention` | record a decision into the right skill file, in the right section |

`/sync` is the fix for the drift the Operator caught. In this run the three surfaces fell out of step because updating them was three separate manual acts with no assertion that they matched.

`/handoff` was performed manually and worked well - the relevance rebuild brief went into the Hub log and was messaged to the live `/list dave 10.8` session. Worth making one action.

---

## 6. What replaces the SOP

**Recipes.** The same content, with no executor:

> **New campaign** = `/offer` -> `/playbook` -> `/copy` -> `/spintax` -> `/campaign new` -> `/deploy` -> `/gateway` -> `/sync` -> `/export`

A recipe is a note for the Operator, not a program for the agent. Run what you want, skip what you want, reorder freely. Nothing declares `STEP 3 - OWNER: OPERATOR`. Nothing holds.

**Keep exactly one thing from sop-runner:** *draft, show, wait - before anything external.* That is not procedure, it is a safety property, and it attaches to the commands that write outward.

**Retire:** step numbering, owner declarations, the "hold and name the next step" ritual, the mandatory context step, and the one-step law. In this run the one-step law actively prevented answering questions the Operator had already asked.

---

## 7. Build order, if only a few get built

1. **`/line`** - highest frequency by an order of magnitude, and its substitution contract fixes the exact failure that cost the Operator's trust in this session.
2. **`/trace`** - highest leverage. Found a 38% list defect from a one-line question.
3. **`/sync`** - highest damage prevented. The difference between three surfaces agreeing and three surfaces quietly disagreeing.
4. **`/debug`** - because the client's most consequential open defect is an unbuilt automation, and nobody can currently look inside one quickly.

---

## 8. Where I am genuinely unsure

Stated because the Operator asked for honesty, not a sales pitch.

- **I do not know the mechanism.** Whether these become slash commands, skills with different frontmatter, or something else is a build decision I have no view on from inside a mining session. The design above is about granularity and contracts, not implementation.
- **Atomising can lose safety.** The SOP's ceremony is annoying, but it did force a pause before external writes. If commands are cheap and unprompted, the "draft, show, wait" property has to be enforced per-command or it will erode. This is the main risk in the proposal.
- **Some work genuinely is a run.** Onboarding is a real sequence with real dependencies and a real ordering. It may be the one place a procedure earns its keep. I would not assume every SOP dissolves equally well.
- **Command sprawl is a real cost.** Thirty commands nobody remembers is worse than nine SOPs. The set above should probably ship at four and grow only on evidence of repeated use.
- **I have not tested the split rule.** "If you would type it mid-sentence, it is a command" is clean and matches this session, but one session is one data point.

---

## 9. The one-line version

The SOP did not slow this session down because it was badly written. It slowed it down because **it modelled the work as a pipeline when the work is a conversation with tools in it.** Commands match how the Operator actually thinks. That is the whole change.
