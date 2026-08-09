---
Type: Sequence
client: Adelante
segment: UK DTC - Offer-led
channel: email
playbook: offer-led
updated: 2026-08-06
---

# Cold Email Sequence

**Audience:** UK DTC, the whole list. This lane does not use the Trustpilot rating, so it runs on brands the Default lane cannot use.
**Shape:** 2 / 1 · **Tokens:** {{first_name}}, {{company_name}}
**Sender:** PlusVibe, workspace Flowroots X Adelante.
**Live campaign:** `6a748fc20beeb7c5646381da` — built as a draft 2026-08-06.

**Build notes.** Second cut of the UK DTC build, written after the 2026-07-28 campaigns returned 4 positive replies on 2,705 contacted, and after François Bonja's feedback on 2026-08-04.

Email 1 runs two variants on identical bodies, so the split reads the subject line cleanly. The eligibility bar lives in email 2, per the playbook, which is why touch 1 carries no rationing line.

Risk reversal is stated as terms inside the ask, never as a formal guarantee block, per the playbook. "Free" is kept out of the subject line as a filter trigger.

**Open item.** "Over email" as the demo delivery is unconfirmed against the WhatsApp-number build on record.

---

## Email 1

### 1A

**Subject:** more sales at {{company_name}}

Hey {{first_name}}, every question that waits an hour is a sale someone else takes.

If we could get {{company_name}} more sales using an operated AI agent (built on your store, wired to your systems, managed by our team every week), and you only pay once it solves half of your existing inquiries, would that be worth sharing more?

*[signature]*

P.S. We recently did it for a UK beauty brand on 1,200 orders a day, where it now handles 80% of tickets end to end and their sales climbed with the rating.

### 1B

**Subject:** half your inquiries, or nothing

Hey {{first_name}}, every question that waits an hour is a sale someone else takes.

If we could get {{company_name}} more sales using an operated AI agent (built on your store, wired to your systems, managed by our team every week), and you only pay once it solves half of your existing inquiries, would that be worth sharing more?

*[signature]*

P.S. We recently did it for a UK beauty brand on 1,200 orders a day, where it now handles 80% of tickets end to end and their sales climbed with the rating.

---

## Email 2 — threaded, no new subject

Single variant.

For context, we only do this for stores already handling real support volume, since that is where it actually shows up in sales. That is why {{company_name}} came up.

I can build you an initial version here, over email. Worth doing?
