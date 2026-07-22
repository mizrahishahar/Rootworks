---
type: playbook
vertical: [copy]
channel: [linkedin]
sources: intent list
---

# Website-visitor

Someone from their company looked at our site. High intent, but noisy: identity resolution guesses, so an unfiltered call-out to a non-buyer is the embarrassing false positive. Filter to ICP first, always.

## The play

Light, low-pressure, give the out.

Keep it light and disarm the creep factor. Split-test transparent (open on the visit) against silent (open on {{problem}} with no mention of the visit); silent often wins. The body is the offer, no pressure.

## Needs

- A visitor-ID feed, filtered hard to ICP before anyone is contacted.
- Vars: `{{company_name}}`, `{{problem}}`.

## Touches

Connection-gated.

- **Connection request** - blank.
- **Message 1** - transparent (saw the visit) or silent (open on the problem). 2 variants.
- **Message 2** - a soft, no-pressure nudge. 2 variants.

## Template

**Connection request** - blank

**Message 1** (on accept, silent variant)

> Hey {{first_name}}, quick one - are you looking into {{problem}} right now, or just early research?
>
> {the offer, softly, no pressure}

**Message 2** (follow-up)

> {a light nudge, or point them to the right thing either way}

## Examples

> Hey {{first_name}}, saw someone from {{company_name}} was on our site.
>
> Are you actively looking into {{problem}}, or just doing some early research?
>
> Happy to point you to the right thing either way.
