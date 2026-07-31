# UK DTC Outbound — Chat Intel Brief

**Data:** `UK-DTC-chat-intel-FINAL.csv` — 1,012 UK DTC domains (Shopify/Woo), one row per domain, decision-maker contact attached.
**Chat-only cut:** `UK-DTC-chat-only.csv` — 291 rows with real chat evidence, **no** shipping-policy quotes.
**All replies:** `verbatim-replies.txt` — the 120 captured bot replies, grouped, each tagged with helpdesk vendor.

**Method:** every reachable site's live support chat was opened in a real browser and sent one message — *"Where is my order?"* — and the settled first reply captured verbatim. **120 verbatim replies.**

---

## Start here: the `pitch` column

Every row is tagged **`pitch`** + **`pitch_angle`**. Work top-down.

| `pitch` | n | meaning |
|---|---|---|
| `PITCH-STRONG` | 43 | Chat demonstrably failed to answer WISMO. Quote it. |
| `PITCH-GOOD` | 205 | Structural gap — menu-only, email-gated, pre-chat form. |
| `PITCH-DIFFERENT-ANGLE` | 622 | **No chat at all.** Different opener required — see below. |
| `PITCH-WEAK` | 6 | Asks for an order number; may resolve after. Verify first. |
| `SKIP` | 63 | Gorgias stock AI flow. Do not pitch. |
| `SKIP-HANDLED-WELL` | 4 | Handled WISMO competently. Do not pitch. |
| `REVIEW` | 22 | Unmatched reply; some are page content, not chat. Eyeball. |
| `NO-DATA` | 47 | Site blocked the automated browser. Live, just unprobed. |

### Quote columns
- **`chat_reply_verbatim`** — exactly what their bot said (120 rows)
- **`email_quote`** + **`email_quote_source`** — `live-chat` (26) or `published-policy` (434)

**Never write "your bot told me…" for a `published-policy` quote.** Say "your shipping page says…" instead.

---

## PITCH-STRONG — the 43. Send first.

**A-hot (11)**

| domain | vendor | contact | evidence |
|---|---|---|---|
| 16arlington.co.uk | Gorgias | Fatima, MD | *"We will get back to you in about 4 minutes"* |
| becopets.com | Gorgias | George, Corp Acct Mgr | *"wait time is greater than 15 minutes"* |
| metier.com | Gorgias | Sofia, CEO | *"wait time is greater than 15 minutes"* |
| years.com | Gorgias | Darren, CEO | *"Here is an article that may help"* |
| beardsanddaisies.co.uk | Gorgias | Luke, Co-Founder | *"We will be with you in a few minutes"* |
| harrysoflondon.com | Gorgias | Sean, MD/Founder | *"We will be with you in a few minutes"* |
| ironheart.co.uk | Gorgias | Adam, COO | *"We will be with you in a few minutes"* |
| javelinbipod.com | Intercom | John, NED | *"Within 4 hours"* |
| thisisunfolded.com | Gorgias | Cally, Co-founder/CEO | *"a person will follow up in a few hours"* |
| lilyarkwright.com | Chatra | Lauren, MD & Co-founder | **no reply at all** |
| poppyspicnic.co.uk | Intercom | Dylan, Founder | **no reply at all** |

**B-good highlights**

- `candykittens.co.uk` (Edward, CEO) — *"We will be with you in a **few hours**"* — they edited the default to be worse
- `thekidcollective.co.uk` — *"back to you in about 6 minutes"*
- `dartscorner.co.uk` (Craig, MD) — *"Take a look at this article… **I can't retrieve the source articles right now**"*
- `londonlash.com` (Hanna, Founder) — a "24/7 Assistant" replied in **Portuguese** to an English question
- `snackfully.co.uk` — *"wait time is greater than 15 minutes"*
- `trotters.co.uk` — Virtual Assistant that answers with an article, not the order

**Silent queues (24 total)** — message sent, nothing came back. Founder/COO contacts: `sunspel.com`, `npeal.com`, `grenade.com`, `sbdapparel.com`, `escentric.com`, `yogamatters.com`, `tree2mydoor.com`, `totm.com`, `rupertsanderson.com`, `neptune.com`, `mypetnutritionist.com`, `purespauk.com`, `swaledale.co.uk`, `scaramangashop.co.uk`, `lovehilltop.com`, `avant-skincare.com`, `seamagik.com`, `proteinpackage.co.uk`, `hazchemsafety.com`, `wessex-tubas.com`, `ces-hire.com`.

> **Watch out:** 6 of the 11 A-hot are the *same Gorgias template*, word for word. **Quote the specific number** ("4 minutes", "15 minutes") — never imply the wording is bespoke to them.

---

## PITCH-GOOD — 205
Menu-only (no free-text box), email-gated, or pre-chat form. Two sub-types:

- **Email-gated** (e.g. `bremont.com`): demands an email before accepting any message. Bremont's menu offers only "download a brochure" and "book a factory tour" — no order option at all. Angle: *a customer can't even ask where their order is without handing over an email.*
- **Truly menu-only** (e.g. `damsonmadder.com`): no free-text box exists.

Not messaged — by design, not failure. Quote via `chat_opening_state`.

---

## PITCH-DIFFERENT-ANGLE — 622 (the majority)
**No storefront chat at all.** Many run Gorgias/Zendesk for email tickets only — 120 matched the contact-form script but never the chat widget.

**Do not open with "your AI can't finish the job."** There is no AI to critique. Lead with the WISMO volume they absorb by email, and use their published delivery window as the hook.

---

## Do NOT pitch

**`SKIP` — 63 login-gated.** Replies are near-identical: *"Please log in so we can look up your latest order… Verify order details."* **62 of 63 are Gorgias** running unedited stock copy — a vendor default, not a brand decision. The login wall also means resolution was never observable. Attacking this attacks Gorgias's boilerplate, not their choices.

**`SKIP-HANDLED-WELL` — 4.** These genuinely did the job; pitching them as broken is factually wrong and they'd know it:
- `honeypotfurniture.co.uk` — apologised, collected order no. + name + postcode, clean handoff
- `sunnamusk.com` — acknowledged the issue and began routing by country
- `shiresequestrian.com` — crude but functional order-number lookup
- `josephjoseph.com` — gives a real tracking URL and clear steps

---

## Cautions

1. **Repeat probes disagree.** `belstaff.com` escalated to a human on one run and gave login-gated lookup on another. Same bot, different answer. Quotes are genuine; classification is not stable. **Re-probe before building brand-specific copy.**
2. **`no-chat-widget` is the softest bucket.** A consent-overlay bug suppressed widget detection until found and fixed; the full set was re-run, recovering 40 probes and 17 replies. Residual false negatives possible.
3. **`REVIEW` (22) contains noise** — `braintumourresearch.org` returned donation-page copy, not a chat reply.
4. **Deliverability.** 115 rows have a personal email on a company domain, and most of the list was never bounce-verified. Verify before sending. Don't cold-send from the root brand domain.

---

## Send order

1. **11 A-hot `PITCH-STRONG`** — hand-write, quote the bot
2. Remaining 32 `PITCH-STRONG` (silent queues especially)
3. `PITCH-GOOD` A-hot (42)
4. `PITCH-DIFFERENT-ANGLE` A-hot, using the email-volume opener
5. Everything else
