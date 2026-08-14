---
Type: session-log
date: 2026-08-12
vertical: [list-building, infrastructure]
status: proposal — nothing built, nothing changed
---

# Session log — from SOPs to atomic commands

Written at the Operator's request at the end of a ~10-hour session that spanned Adelante and Dave.io. The Operator's framing: *"the SOP model is not it. it is not working."* This log records the diagnosis, the proposed replacement, and the honest caveats. **Nothing here has been built.** It is a proposal and a record of thinking, not a change.

---

## 1. What actually happened, and why it matters

The session opened as `/List adelente 6.8`. The SOP died roughly 5% in — around step 1-2 — and was never returned to. Not because it was wrong, and not because anyone decided to abandon it. It simply stopped being the thing that described the work.

What replaced it, over ten hours, was roughly fourteen distinct atomic actions in an order no procedure anticipated:

relevance filter → create a field → debug an n8n automation → back to relevance → view standardisation → segment → deploy → verify personalisation → write an AI field prompt → re-deploy → harden a relevance filter → segment again → audit a table → standardise another table.

**The diagnosis is not "SOPs have the wrong steps." It is that SOPs assert there is an order.** They assume a session runs one job start to finish. The real session is the Operator jumping: *"do relevance on this table"*, *"now segment it"*, *"now why did this automation fail"*, *"now back to views."* Against that, an SOP's step counter is not just dead weight — it is actively harmful. It made me announce steps and gate on the Operator when the Operator wanted a single action performed and returned.

### The thing SOPs got right, which must survive

SOPs carried one genuinely valuable thing: **ordering knowledge**. The waterfall must run before segmenting means anything. Relevance must be decided before enrichment spends money. A deploy must not precede a personalisation check.

If we delete SOPs and keep only atomic commands, that knowledge evaporates and we will silently do things out of order.

**The proposed fix: move ordering from a procedure into a precondition on each command.** `/segment` refuses to run on a table whose waterfall has not finished, and says why. `/deploy` refuses on a campaign whose tokens have not been verified. The guarantee survives; the rigidity does not. This is the single most important idea in this document.

---

## 2. The split: skill vs command vs tool

The Operator flagged that they had not worked out the command/skill boundary. Proposed:

| | What it is | Test |
|---|---|---|
| **Skill** | Judgment with no beginning or end. You *become* it. Never touches a tool by itself. | "Could two different commands both need this?" → skill |
| **Command** | One transaction against the world: precondition → act → **verify** → report → return to Operator. | "Does it end with something verifiably true that wasn't true before?" → command |
| **Tool** | The mechanics of one system. Gotchas live here. | "Does this change if we swap PlusVibe for Smartlead?" → tool |

The skill definition is unchanged from today's model and remains correct. The *command* is the new thing, and it is narrower than an SOP by an order of magnitude.

**The property SOPs lacked that commands must have: a command ends in a verified fact, not a completed step.** Every count trusted in this session came from arithmetic — 751 + 528 = 1,279; 340 + 584 = 924 — never from expectation. A step can be "done" and wrong. A verified fact cannot.

---

## 3. The command contract

Every command file carries the same five lines:

```
precondition:  what must already be true (refuse + say why if not)
target:        named explicitly — /relevance <table>, never "run relevance"
skills:        which judgment it loads
verify:        the arithmetic that proves it worked
postcondition: what is now true
```

Two rules this session paid for directly:

- **Destructive commands name their target back before acting.** I twice came within one click of rewriting the wrong table's filter — once on Calialfa's `Relevant` while aiming at Cultivado, once on Adelante's original `Relevant` while aiming at a duplicate. Both were caught at the Apply screen. Neither would have been caught by a row count, because both would have produced a plausible number.
- **A command that mutates shared state re-reads it after the mutation.** The deploy machine reported "Succeeded, 0 errors" on a deploy that shipped without `first_name_he`. It verified row presence, not variable presence.

---

## 4. The catalogue

**★ = this session proved it exists as an atomic unit. ○ = extrapolated, lower confidence.**

### Base / list building
| Command | Does |
|---|---|
| ★ `/relevance <table>` | Sample real rows → compose `Relevant` + `Cut review` as exact complements → build → verify they sum to the table |
| ★ `/harden <view>` | Read both sides of a *live* filter; name what leaks in and what is being lost; tighten. **Its own command, not part of `/relevance`** — we ran it hours later on a filter that already existed and was believed correct |
| ★ `/segment <view>` | Propose the split, build it, prove it sums to parent and that no row falls outside |
| ★ `/reconcile <view>` | Sum-check alone. Ran standalone at least five times. Found 3 orphans in a 662-row feed |
| ★ `/field-shape <field>` | What does this field actually hold — type, buckets, blanks? |
| ★ `/table-init <table>` | The heavy one: `manually_approved` + the full standing chain + field visibility, to spec |
| ★ `/view-audit <table>` | Census: what exists, what violates the standard, what is orphaned or fake |
| ★ `/add-field` | Create a field to spec via API |
| ○ `/count <filter>` | Exact count, always stated with the scope it was computed under |
| ○ `/icp <source>` | Describe an ICP for DiscoLike / Supersoniq |
| ○ `/waterfall <view>` | Fire enrichment on a launch surface |

### Copy
| Command | Does |
|---|---|
| ★ `/ai-prompt <field>` | Write an Airtable AI field prompt. Done twice (`first_name_he`, `company_clean`); the Hebrew one took four iterations |
| ○ `/copy <campaign>` | Write the sequence. Short. Not the SOP |
| ○ `/spintax <step>` | |
| ○ `/rewrite <step>` | One variant, one step |

### Deploy / infra
| Command | Does |
|---|---|
| ★ `/deploy <view> → <campaign>` | Launch row + **verify the leads landed with their variables** |
| ★ `/verify-personalization <campaign>` | Every token present AND populated, pre-send |
| ★ `/debug <automation>` | Read the execution, name the fault, propose the fix |
| ★ `/rerun <execution>` | |
| ○ `/blocklist <email>` | PlusVibe blocklist + ClayRoots DNC, both, always |

### Around the work
`○ /log` · `○ /message <client>` · `○ /report <client>` · `○ /standard <thing>`

---

## 5. The three that will change the most

1. **`/field-shape`** — trivial to build, cheapest insurance in the catalogue. Every expensive mistake today began with an assumption about what a field contained. `Infra Employees` turned out to be a *text* field holding ranges (`0`, `1`, `2-3`, `4+`), so `> 1` matches nothing. An hour lost to a wrong assumption that one free lookup would have killed.
2. **`/reconcile`** — "the numbers add up" is the only proof a segment set will not double-send or silently strand leads. It found 3 orphans in 662 that nobody would ever have noticed, because each individual view looked healthy.
3. **`/debug`** — the Operator called this out and is right. It is the command the current model serves worst, precisely because it is never *planned*. It has no home in any SOP; it interrupts one.

---

## 6. What I would not convert

- **`/tam` is already atomic.** Leave it.
- **`/campaign-create`, `/campaign-status`** are thin wrappers over the sender. Not worth a command each.
- **`Onboarding` should probably stay an SOP.** It is the one job that genuinely runs once, start to finish, in order, with a clear terminus and no jumping. Not everything has to convert, and converting it would be dogma rather than judgment.
- **`Inbox` is a genuine hybrid** and I am least confident here. It has a real run shape (list everything → work one at a time → gate between each), which is SOP-like. But the atoms inside it (`/reply <thread>`, `/followup <lead>`) are exactly the granular calls the Operator wants. My instinct is: keep the run as a command that *loops*, expose the atoms separately. Flagged as unresolved.

---

## 7. Honest caveats

- **This is a proposal from one session's evidence.** It is a heavy, unusual session — two clients, deep Airtable work, three automation failures — and it over-weights list-building and infrastructure. Copy and inbox are under-represented in the ★ column not because they are less atomic but because we barely touched them today.
- **The precondition idea is the load-bearing claim and it is untested.** If preconditions are too strict, commands refuse constantly and the Operator routes around them, which is worse than an SOP. If too loose, the ordering guarantee is theatre. This needs a real trial on two or three commands before the catalogue is built out.
- **I have not resolved where per-command state lives.** An SOP carried context between steps implicitly. Atomic commands do not. `/segment` needs to know what `/relevance` decided. Today that lives in the view chain itself (the views ARE the state), which is probably the right answer for the base commands — but it is not obviously the right answer for copy or inbox.
- **The command count is a risk.** Roughly 25 commands is a lot to hold. If the Operator cannot remember them, they will not be used and we will be back to prose instructions. Worth considering whether the ★ set (13) ships first and the ○ set waits for demand.

---

## 8. Session state at time of writing

- **Vault writes are blocked.** The `obsidian` CLI returns `No valid credentials found in any of the expected locations` on every call. Two background evals confirmed it. `obsidian auth` needs running before any vault write, including this log.
- Three view-standard sections were written and staged this session but **never landed** for the same reason: `conventions-manager` (replacing `## View naming`), `views-poweruser` (the Chrome-pass mechanics), `list-builder/relevance` (the hardening doctrine). They sit in the session scratchpad.
- Four tables were brought to the view standard and verified: Dave's B2B Tech 11-50, Calialfa & Manifold, Xpand, Cultivado; plus Adelante's `Israeli DTC - Contacts`.
- Open decisions handed to the Operator: delete the four fake segment views on `Israeli DTC - Contacts` (all filter on `Status is done` only, 100% overlapping, campaigns COMPLETED); pin the 2026-08-06 segments with `Tag`; the legacy-view deletion list on the Dave tables.
