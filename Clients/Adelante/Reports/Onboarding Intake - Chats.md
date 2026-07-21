# Adelante - Onboarding Intake (Chats)

Read alongside the onboarding form (`Shared/Onboarding Form - Flowroots - Google Forms.pdf`). The form carries the operation; this carries what was settled in Slack and WhatsApp on top of it. Where the two disagree, this file wins - it is later.

Sources: Slack `#adelante-private` (2026-07-02 -> 2026-07-10), WhatsApp with Tamir (2026-07-13).

---

## 1. The WhatsApp bot - the giveaway

Adelante can hand a prospect a working bot **built on their own brand**. Tamir already has the machinery for it. This is the single biggest asset the form did not carry, and it changes what we can offer a stranger.

Two versions were discussed. They are not the same thing and they sit at different points in the sequence.

### Version A - dedicated number, as the CTA (primary)

A full personalized bot with its **own dedicated phone number**, built for that one prospect.

- **Where it sits:** the **CTA**, not the opener. It is a link, so it cannot carry the top of a cold email.
- **Why it wins:** most impressive version. It is *their* bot, on its own line. No friction beyond tapping.
- **Cost shape:** only built for prospects who already engaged. Work scales with replies, not with sends.

### Version B - centralized number + keyword (test only)

One shared number. The prospect texts the **name of their own company**; the system recognizes the keyword and returns the bot built for them. Tamir: *"תרשום פפאיה ותראה את הבוט שלך"* - already built.

- **Where it sits:** usable **in the copy in advance**, because it is a number and a word, not a link.
- **Shahar was against it**, on three counts:
  1. **A lot of work up front** - every target brand needs a bot before a single send. (Tamir: not a problem.)
  2. **Friction** - "go text this number" is a real ask of a stranger.
  3. **Less impressive** - a shared number reads generic next to a number that is theirs.

### Decision

**Version A is the CTA. Version B is an A/B test - one angle among others, not the default.**

Shahar's guardrail, agreed by Tamir: the bot has to carry real value **as their actual customer service**, not read as a sales trick wearing a demo costume. If it only sells, it dies.

Number in play: **+972 53-596-4340**.

---

## 2. Copy constraints

- **Never name Outlier Group / The Scent Reserve in an email.** Write "a UK brand". The case-study link is fine to send. Tamir flagged the name is currently written into some of his existing sequences - strip it when we port copy.

## 2b. The review teardown opener - already tried, already flopped

Shahar asked whether the "pull their negative reviews and open with the exact quote" idea was tested or just an idea. Tamir, 2026-07-15:

> ניסיתי היו 2 תגובות אבל לא התרומם, הזווית של הדירוגים זה פשוט סיגנל אחד אי אפשר לבנות על זה קמפיין

*("I tried it. There were 2 replies but it didn't take off. The ratings angle is just one signal - you can't build a campaign on it.")*

**This kills the form'\''s headline giveaway.** The form presents the review teardown as opener #1; the client'\''s own test says it is a **signal, not a campaign**. Treat Trustpilot as a targeting filter, not the angle.

It also makes **`Assets/Giveaway - Black Friday Surge Simulator.md`** a candidate opener worth testing - it needs only a domain and rides a timing angle he believes in - but it is untested and does not displace the proven baseline (personalized founder-level). The opener is decided in the `Campaign` run, not here.

---

## 3. Past campaigns (Instantly)

Tamir's existing sequences. Exports are erroring, so these are read in-tool for now.

| Campaign | Read |
|---|---|
| `71defd6b-bf85-4939-b20e-fad014e7796d` | HE - **the one that brought results** |
| `9b780cfc-c1e4-4ff1-bd6e-4b2b69646d65` | HE - new copy written, never sent |
| `4f46aabf-655c-46ff-abba-11a4ad57d177` | EN - AI-rewritten after reviewing all of Tamir's past calls |
| `952eacb8-15c8-48d9-9a50-8b0dfb202664` | EN - older, Trustpilot-focused. Got replies, **no closes** |

Tamir also holds **IL and UK lead lists** from past campaigns, offered to transfer.

---

## 4. Infrastructure (corrects the form)

- Inboxes are managed in **Primeforge**, sending ran through **Instantly**. Sending moves to our workspace - we do not need Instantly to send.
- Primeforge access given: `app.primeforge.ai/adelante/domains`, account `adi@getadelante.com`.
- **Burned inboxes:** `adi@adelanteagent.com`, `adi@aiagentadelante.com`. Their domains may be burned too - Shahar's call.
- Tamir's sender infra is live and warmed. **Coordinate before adding volume on the same domains** so deliverability is not split.

---

## 5. Open

| # | Item | Owner | State |
|---|---|---|---|
| 1 | **Instantly access** - exports all error, and it is blocking us. Shahar asked for direct access instead. | Operator | **Locking tomorrow (2026-07-16)** |
| 2 | **StoreLeads as a provider** - Shahar registered directly, no code needed. Unclear why exports must route through Tamir (scrapers?). First time we use it as a source. | Claude | **To evaluate this session** |
| 3 | **Kickoff call** - Tamir booked Sunday, Shahar proposed Thursday to leave prep room and start on the warmed inboxes first. | Operator | Unanswered |
