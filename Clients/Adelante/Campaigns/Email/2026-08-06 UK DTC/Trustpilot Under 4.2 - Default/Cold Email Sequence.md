---
Type: Sequence
client: Adelante
segment: UK DTC - Trustpilot Under 4.2
channel: email
playbook: default
updated: 2026-08-06
---

# Cold Email Sequence

**Audience:** UK DTC brands rated under 4.2 on Trustpilot.
**Shape:** 4 / 1 · **Tokens:** {{first_name}}, {{company_name}}, {{trustpilot_rating}}
**Sender:** PlusVibe, workspace Flowroots X Adelante.
**Live campaign:** `6a748fbe78b225f68c366604` — built as a draft 2026-08-06.

**Build notes.** Second cut of the UK DTC build, written after the 2026-07-28 campaigns returned 4 positive replies on 2,705 contacted, and after François Bonja's feedback on 2026-08-04: copy too long, lead with outcome not mechanism, kill the WhatsApp-number CTA, soft ask.

Email 1 is a 2x2: two bodies against two subject lines.

| | Subject: `{{company_name}} + adelante` | Subject: `support at {{company_name}}` |
|---|---|---|
| Body A | 1A | 1B |
| Body B | 1C | 1D |

**Open items.** `{{trustpilot_rating}}` must be joined from `Reports/UK-DTC-chat-intel-FINAL.csv` and cast to a bare number before deploy. "Over email" as the demo delivery is unconfirmed against the WhatsApp-number build on record.

---

## Email 1

### Body A — proactive

**Subject:** {{company_name}} + adelante

Hey {{first_name}},

I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot, which usually means you are losing sales to questions nobody answered in time.

We fix that with a proactive AI agent, just like we did for Fold, where it plugs into their systems and answers all of their 100+ daily inquiries instantly. People buy instead of leaving.

If it does not resolve half your inquiries from day one, you do not pay.

I can build you a first version to try, right here over email. Want me to?

### Body B — operated

**Subject:** support at {{company_name}}

Hey {{first_name}},

I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot, which usually means you are losing sales to questions nobody answered in time.

We solve that with an operated AI agent. It wires into your systems. Checks the order. Sends the tracking. Starts the return. Our team builds it and runs it, week after week.

Fold, a UK brand, has it on 100+ inquiries a day. Every one answered the second it lands. People buy, and they come back.

If it does not resolve half your inquiries from day one, you do not pay.

Mind if I share more info?

---

## Email 2 — threaded, no new subject

### 2A

FYI, we only offer this to brands in your Trustpilot range, because that is typically where the most sales get lost.

It is the same reason we guarantee it: half your inquiries resolved from day one, or you do not pay.

We can make it live before Black Friday, when these inquiries are worth the most revenue.

I can build you the initial version now, over email. Want to see it?
