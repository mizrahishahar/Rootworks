---
Type: Sequence
client: Adelante
segment: UK DTC - Shopify Plus - Trustpilot Under 4.2
channel: email
playbook: default
updated: 2026-08-06
---

# Cold Email Sequence

**Audience:** UK DTC, Shopify Plus, rated under 4.2 on Trustpilot.
**Shape:** 2 / 1 · **Tokens:** {{first_name}}, {{company_name}}, {{trustpilot_rating}}
**Sender:** PlusVibe, workspace Flowroots X Adelante.
**Live campaign:** `6a748fbe78b225f68c366604` — built as a draft 2026-08-06.

**Build notes.** Second cut of the UK DTC build, rewritten after two rounds of feedback: François Bonja on 2026-08-04 (too long, outcome not mechanism, kill the WhatsApp CTA, soft ask) and Tamir on 2026-08-06.

Tamir's calls, applied here: the lane is repositioned to **Shopify Plus**, which speaks revenue rather than sales; subject lines were rewritten after he rejected `{{company_name}} + adelante` and `support at {{company_name}}`; and the subject now matches the first line of its own body, so the 2x2 collapsed to two matched variants. Trustpilot is a lever, never the headline claim, per his warning that leading on it makes us read as a reviews tool.

Each variant runs problem, cause, mechanism, outcome, then the guarantee. A carries revenue, B carries online reputation, and each is proved by the case that can actually evidence it.

**Open items before send.** `{{trustpilot_rating}}` must be joined from `Reports/UK-DTC-chat-intel-FINAL.csv` and cast to a bare number. "Over email" as the demo delivery is unconfirmed. The 4.2 in variant B is Tamir's figure from 2026-08-06; the case study page says 4.0. The "seen more" consequence is an inference, not a documented result.

---

## Email 1

### Variant A — net revenue

**Subject:** net revenue at {{company_name}}

Hey {{first_name}},

I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot, which usually means you are losing net revenue to questions nobody answered in time.

We fix that with a proactive AI agent that plugs into your systems and answers every one of them in seconds, so the buyer never leaves to find out.

That is what we built for Fold, a UK brand on 100+ inquiries a day, where every question now gets answered the second it lands.

You will get half of your inquiries solved from day one, or you pay nothing.

I can build you a first version to try, right here over email. Want me to?

### Variant B — online reputation

**Subject:** {{company_name}} online reputation

Hey {{first_name}},

I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot. It became important again, because it is the first source ChatGPT pulls when it recommends a brand like yours.

We handle that for you behind the scenes, with a proactive AI agent that wires into your systems, resolves orders and tickets, and pushes your rating up.

A UK ecom store doing 1,200 orders a day now resolves 80% of their tickets end to end, and their rating went from 3.5 to 4.2. So they get seen more when someone asks.

You will get half of your inquiries solved from day one, or you pay nothing.

Mind if I share more info?

---

## Email 2 — threaded, no new subject

Single variant.

FYI, we only offer this to brands in your Trustpilot range, because that is typically where the most net revenue gets lost.

It is the same reason we guarantee it: half your inquiries resolved from day one, or you do not pay.

We can make it live before Black Friday, when these inquiries are worth the most revenue.

I can build you the initial version now, over email. Want to see it?

---

## Previous messages

Retired 2026-08-06. The first cut of this lane, before the Shopify Plus repositioning and Tamir's subject-line feedback. Ran as a 2x2: two bodies against subjects `{{company_name}} + adelante` and `support at {{company_name}}`.

**Body A**

> Hey {{first_name}},
>
> I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot, which usually means you are losing sales to questions nobody answered in time.
>
> We fix that with a proactive AI agent, just like we did for Fold, where it plugs into their systems and answers all of their 100+ daily inquiries instantly. People buy instead of leaving.
>
> If it does not resolve half your inquiries from day one, you do not pay.
>
> I can build you a first version to try, right here over email. Want me to?

**Body B**

> Hey {{first_name}},
>
> I saw {{company_name}} is rated {{trustpilot_rating}} on Trustpilot, which usually means you are losing sales to questions nobody answered in time.
>
> We solve that with an operated AI agent. It wires into your systems. Checks the order. Sends the tracking. Starts the return. Our team builds it and runs it, week after week.
>
> Fold, a UK brand, has it on 100+ inquiries a day. Every one answered the second it lands. People buy, and they come back.
>
> If it does not resolve half your inquiries from day one, you do not pay.
>
> Mind if I share more info?
