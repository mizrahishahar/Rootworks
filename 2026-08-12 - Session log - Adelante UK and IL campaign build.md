---
Type: Session Log
client: Adelante
span: 2026-08-06 to 2026-08-11
channel: email
---

# Adelante — UK + IL Campaign Build — Session Log

Everything from the `Campaign` run that produced five campaigns, rebuilt the Hebrew sending setup, and surfaced a set of open questions nobody has closed yet. Written so the next session does not have to reconstruct any of it.

**Nothing in here is a decision. It is the record, the reasoning, and the things still hanging.**

> **Vault state at time of writing.** `Rootworks/Clients/` no longer exists. It was dissolved partway through this work, so the five sequence files this session wrote to `Clients/Adelante/Campaigns/Email/...` are gone from the vault. **PlusVibe and the Hub Campaigns table hold the full, current copy for all five campaigns** — those are now the only live record. Nothing was lost that is not reconstructible from the Hub `Campaign Copy` field.


---

## What exists now

| Campaign | PlusVibe ID | Shape | Audience |
|---|---|---|---|
| 2026-08-06 - UK DTC - Trustpilot Under 4.2 - Pitch-led | `6a748fbe78b225f68c366604` | 2 / 1 | rated under 4.2, min 3 reviews, ~812 |
| 2026-08-06 - UK DTC - Trustpilot 4.2+ - Asset-led | `6a749011d162725bb09e3ed0` | 2 / 2 | rated 4.2+, ~1,248 |
| 2026-08-06 - UK DTC - No Trustpilot - Offer-led | `6a748fc20beeb7c5646381da` | 2 / 1 | no rating, plus thin-rating rows, ~1,576 |
| 2026-08-06 - Israeli DTC Hebrew - General | `6a785c53e6166f464988819f` | 4 / 1 | IL DTC, bot- and vertical-agnostic |
| 2026-08-06 - Israeli DTC Hebrew - General - No Name | `6a787b4db887ba6d86d59e4d` | 4 / 1 | same, for leads with no first name |

All three UK campaigns are **ACTIVE with zero sent**. Both Hebrew campaigns are **DRAFT with zero leads**.

Sequence files sit under `Campaigns/Email/2026-08-06 UK DTC/` and `Campaigns/Email/2026-08-06 Israeli DTC Hebrew/`. Hub Campaigns rows carry the same copy, spintax stripped.

---

## The UK segmentation, and what it did to the copy

The three UK campaigns were originally split by **copy angle**. On 2026-08-10 the `List` run resegmented them by **Trustpilot state**, so the angle became a property of the audience rather than the other way round. Names were rewritten audience-first.

This is a better design than what I built. It means:

- **Only Pitch-led may mention Trustpilot.** It is the only campaign whose leads carry a rating, and its opener renders `{{trustpilot_rating}}` directly. The 3-review floor on that view exists so we never quote a score built on one or two reviews.
- **Asset-led now goes to well-rated brands.** Nothing in it may imply a reputation problem. Its copy happens to be Trustpilot-free, so it survived the resegmentation untouched. That was luck, not design.
- **Offer-led goes to brands with no Trustpilot at all.**

### The one line the resegmentation broke, and it is still live

Offer-led's P.S. ends:

> ...where it now handles 80% of tickets end to end **and their sales climbed with the rating**.

That is going to 1,576 brands who have no rating. It does not break factually, since it describes the case study's rating and not the reader's. But it is the **last line of the email**, so it is the note the reader ends on, and for this audience that note lands on something they do not possess.

Proposed replacement, same case, no rating:

> ...where it now handles 80% of tickets end to end without anyone being added to the team.

Operator called it marginal. It is. It is also the only genuinely wrong line in the three UK campaigns.

---

## The Shopify Plus detour

Tamir's 2026-08-06 call set a segmentation rule: **Shopify Plus speaks revenue and EBITDA, regular Shopify speaks sales.** Pitch-led was repositioned to Plus on that basis, and its copy rewritten from "losing sales" to "losing **net revenue**".

Plus was then dropped, not enough volume to justify a separate cut. The name reverted. **The copy did not.**

So Pitch-led still opens on "losing net revenue" and its follow-up still says "that is typically where the most net revenue gets lost", both of which were written for an audience that no longer exists as a segment. Offer-led, going to a comparable audience, says "more sales".

Two words in each place. Unresolved.

---

## Number conflicts, all unresolved

These are the ones that matter, because they are checkable by a prospect.

### Modibodi

| Source | Number |
|---|---|
| Case study page + `Assets/FAQ - HE.md` | **50%** |
| Onboarding form | ~70% |
| Live 20.7.26 Hebrew campaign copy | **70%** |
| `Reports/Product Marketing KB.md`, dated 2026-07-30, marked "verified, use verbatim" | **75%** |
| **Tamir, 2026-07-23 call, 46:43** | **75%** |

Four sources, three numbers. Deployed in the new Hebrew campaigns: **75%**, because that is what Tamir said out loud and what the KB carries. The number a prospect can verify on the site is 50%.

Tamir also gave the volume, same call, 47:30: **~1,500 inquiries a month**. That is now the A/B in the Hebrew campaigns — variants A and B carry the volume, C and D carry the percentage alone.

### The UK rating

| Source | Number |
|---|---|
| Case study page, Hebrew FAQ, Product Marketing KB | **4.0** |
| Onboarding form | 4.1 |
| Tamir, verbally, 2026-08-06 | **4.2** |

Deployed in Pitch-led variant B: **4.2**, on the Operator's call. Two written sources say 4.0. `Assets/Case Study - Outlier Group.md` says explicitly: *"Use 4.0. We do not inflate his flagship past what his own page backs."*

A prospect who clicks the case study sees 4.0 against an email saying 4.2.

---

## Things Tamir said that we did not follow, and one we broke

### Papaya was explicitly ruled out, and I used it anyway

2026-07-23, 46:34:

> "פפאיה, הנתונים שם הם פחות טובים, לא בגללנו, בגלל שהוא לא חיבר אותנו עדיין ל-CRM שלו... לא הייתי משתמש בפפאיה."

I built both Hebrew campaigns on Papaya's 200-to-400-per-1,000. That number is 20 to 40%, **below the 50% we guarantee two lines later**, so the email promised more than its own proof delivered. Fixed on 2026-08-11, swapped to Modibodi.

Root cause worth naming: I chose Papaya for the word "close" and the demand-gen frame and never checked it against the guarantee or against what the client had already said about it.

### He prefers percentages over absolute numbers

Same call, 47:45 to 48:00. Absolute numbers invite comparison with bigger brands, e.g. Terminal X at 50–100k inquiries a month, who would read 1,500 and dismiss it. At 48:45: *"אני לא נשאתי אף פעם מספרים אבסולוטיים... זה קצת אובר אופטימיזציה."*

The Operator's counter, 48:06, was that percentages alone read like dodging. The compromise proposed on the call, absolute numbers for small brands and percentages for large, was never implemented. The current A/B is the closest thing to testing it.

### The name constraint on the flagship case

`Assets/Case Study - Outlier Group.md` and `Reports/Onboarding Intake - Chats.md` both say: **never name Outlier Group / The Scent Reserve in an email body.** Write "a UK beauty brand". The link is fine to send.

Operator overrode this mid-session, then the copy moved back to unnamed anyway as it was rewritten. Current state: **no campaign names them.** Fold is named, which is cleared.

The rationale for the ban is not recorded anywhere. Worth asking, because the constraint costs us the strongest lever in the strongest case, and the name is on the page the moment they click the link.

---

## Claims currently deployed that nothing backs

**Asset-led, Email 2 variant A:**

> They gave the agent 10% of their tickets at first, then raised it to 80%. **It really proved itself on Black Friday, by the way.**

Black Friday is not in the case study. Not in the FAQ, not in the KB, not in the onboarding intake. It is in on the Operator's say-so and has never been confirmed with Tamir. It is also the most persuasive sentence in that email, which is exactly why it needs to be true.

**Same email, first line:**

> if it is easier I can send a video instead of the text version.

**Nothing in `Assets/` names a video.** The 2026-07-16 onboarding handoff lists it as owed by Tamir and still missing: *"The Loom / video walkthrough — 'available on request' per the form, nothing on file."* If a prospect says "yes, video please", there is nothing to send.

**Pitch-led variant B:**

> So they get seen more when someone asks.

The ChatGPT-reads-Trustpilot framing is Tamir's, from the 2026-08-06 call. The consequence, that they get seen more, is our inference. Nothing measures it.

**Both Pitch-led variants and both Hebrew campaigns:**

> I can build you a first version to try, **right here over email**.

Everything on record is the WhatsApp bot on a dedicated number, built per prospect by Tamir. The 2026-08-06 call confirms he builds them **by hand within 8 hours** for hot leads, so fulfilment exists. What does not exist on record is an **email-native** delivery. This CTA is in four of the five campaigns.

**Asset-led generally:** the playbook requires the asset to carry the offer, the proof and the booking path, because the email deliberately carries none of them. Nobody has opened `getadelante.com/case-study/outlier-group` to check that it does.

---

## Infrastructure: what happened and what it means

### The UK fleet went down and came back

On 2026-08-09 every one of the 40 UK inboxes read `status: ERROR`, `warmup: INACTIVE`. All 40 are Google Workspace. All 16 Hebrew inboxes, which are Microsoft 365 or IMAP, were fine. Workspace-wide warmup volume collapsed from ~1,450/day to 279.

The shape said credential revocation, not deliverability: whole-provider failure at once, with 100% warmup health and 2.8% bounce right up to the stop. Deliverability kills inboxes one at a time.

The Operator handled it. As of 2026-08-10 the sampled UK inbox reads ACTIVE, warmup ACTIVE, 100% health. **The cause was never recorded.** If it was a revoked OAuth grant or a billing lapse, it will recur, and nobody will know why.

**Also seen on `tamir@adelantedesk.com`: `3d_bounce_rate: 14.29`.** Campaigns auto-pause at 5%. One inbox, small sample, but worth watching as volume ramps.

### The Hebrew sending setup was rebuilt

Six inboxes now carry all six Hebrew campaigns, three domains kept in pairs: `easyadelante.com`, `hiadelante.com`, `getadelanteagent.com`.

**How those three were chosen, honestly:** arbitrarily. I applied one real rule, that a domain's seats travel together, then took the first three domains the API returned. Challenged on it, I checked properly: all 8 domains pass SPF, DKIM, DMARC and MX; warmup across the 16 is 99.7% inbox and 0.3% spam; and per-inbox reply data is meaningless at ~30 sends each against François's 500-to-600 threshold. **The data does not separate them.** The pick is now verified as safe rather than justified as optimal.

**Capacity ceiling:** those six carry daily limits of 30, 30, 30, 30, 10, 10. About **140 sends a day** for the entire Hebrew operation, shared across six campaigns. The four old 20.7.26 campaigns are still ACTIVE and draw from the same pool. If the new campaigns go live alongside them, the new copy gets a fraction of 140.

### Two live defects found in the Hebrew inbox settings

**The signature was English on Hebrew inboxes, and signed by the wrong person.** All 16 read `Thanks, Tamir Bashkin, Adelante` — including Adi's eight seats, which therefore signed as Tamir. Nobody had been hit by it because the old Hebrew copy signed with `{{sender_first_name}}` and never rendered `{{sender_signature}}`. I deployed the new Hebrew campaigns using `{{sender_signature}}`, which would have shipped an English, wrongly-attributed block at the bottom of an RTL Hebrew email.

Fixed on the six: Hebrew RTL signature using `{{sender_first_name}} {{sender_last_name}}`, which resolves per seat.

**The opt-out disappeared and I caused it.** The old Hebrew copy carried `נ.ב. השיבו הסר` in the body. I removed it assuming the signature carried an opt-out. It did not. For a period the Hebrew campaigns had no opt-out anywhere, against Israeli law. Now restored as a נ.ב. on Email 2, with the no-commitment line on Email 1.

**No signature in either market carries a postal address.** CAN-SPAM requires one on the UK side, Israeli law requires sender identification. Operator declined to add one. Logged, not argued further.

### Tags

| Tag | Accounts |
|---|---|
| Hebrew | 6 |
| English | 50 |
| UK | 40 |
| Adelante-2 | 40 |
| Adelante-1 | 13 |

`Adelante-1` never covered all 16 Hebrew inboxes, which is where the 13-versus-16 discrepancy came from. It is a provenance tag, not a language one, and is now redundant alongside `Hebrew` and `English`.

Note: assigning the `UK` tag to the 10 freed Hebrew-domain inboxes **did not stick**. `UK` sits on 15 campaigns, and the tag-driven sync pushed them back out rather than adding them to those campaigns. Net effect was cleaner than intended, but it means `UK` cannot be used as a free-form label.

---

## My own errors this session, for the record

1. **Used Papaya after Tamir ruled it out**, and did not notice the proof was weaker than the guarantee.
2. **`update_email_account` is a full replace, not a patch.** I sent name-only updates to five inboxes and wiped their signatures and tags. Restored tags immediately; the signature was restored once the Operator confirmed the intended text. Every account write since sends all fields back.
3. **Removed the Hebrew opt-out** on an assumption about the signature I had not verified.
4. **Picked the six Hebrew inboxes arbitrarily** and presented it as a decision.
5. **Removed the wrong P.S.** from asset-led when asked to fix the duplicate, keeping the opt-out instead of the "no pitch" line.
6. **Let the naming drift from the copy.** The Plus repositioning changed the copy but not the campaign name, folder or Hub row, until the Operator caught it.
7. **Deployed `{{sender_signature}}` into Hebrew** without checking what that field actually contained.

The pattern in most of these is the same: I acted on what I expected the state to be instead of reading it back first. The deployer skill already says verify by read-back, never by response code. It caught 2, 5 and the `set_campaign_email_accounts` silent no-op. It should have been applied earlier in 3 and 7.

---

## Skill changes made this session

`email-deployer` gained two rules, both from things that went wrong here:

- **A P.S. goes after the signature, never before it.** Body, blank line, signature, blank line, P.S.
- **Spin several slots per email, not one.** A spun greeting alone is decoration; the body still lands byte-identical. Four to six spins per touch, never on numbers, names, the guarantee or the meaning of the CTA.

---

## What a next session should decide

**Copy, all cheap:**
1. Pitch-led: "net revenue" or "sales", now that Plus is off.
2. Offer-led P.S.: keep or drop "sales climbed with the rating" for a no-Trustpilot audience.

**Facts, all need Tamir:**
3. Black Friday, true or out.
4. Does a generic video exist.
5. Modibodi: 50, 70 or 75.
6. UK rating: 4.0 or 4.2.
7. Is the first version deliverable over email, or is it WhatsApp.
8. Does the case study page carry the offer and a booking path.
9. Why Outlier Group cannot be named in a body.
10. Would he stand behind an outcome guarantee, revenue or rating, rather than the delivery guarantee we have. This is the single change that would most improve every lane, because right now we sell more sales and guarantee resolved tickets, which are different currencies.

**Operational:**
11. Pause the four old 20.7.26 Hebrew campaigns before the new ones go live, or they split a 140/day ceiling.
12. Record the cause of the UK fleet outage.
13. Watch the 14.29% 3-day bounce on `tamir@adelantedesk.com`.
14. Decide whether `Adelante-1` and `Adelante-2` still earn their place.
