---
type: playbook
vertical: [copy]
channel: [email, linkedin]
sources: intent list
---

# Website-visitor

Someone from their company looked at our site. High intent, but noisy: identity resolution guesses, so an unfiltered callout to a non-buyer is the embarrassing false positive. Filter to ICP first, always.

## Needs

- A visitor-ID feed, filtered hard to ICP before anyone is contacted.
- Vars: `{{company_name}}`, `{{problem}}`.

## The play

Keep it light and low-pressure, and give the out to disarm the creep factor: "saw someone from {{company_name}} checking us out, are you looking into {{problem}} right now or was it just research?" Split-test transparent ("saw you visited") against silent (open on {{problem}} with no mention of the visit); silent often wins. The body is the offer, no pressure. Runs evergreen, auto-enrolling ICP-matched visitors.

## Subject lines

The subjects below are examples; write fresh to the play.

Light, low-pressure, often no signal in the subject at all.
- "{{problem}} question"
- "quick one {{first_name}}"

## The plan

| Variant | Opener | Offer | Proof / risk reversal | CTA |
|---|---|---|---|---|
| 1A | transparent: saw the visit | the offer, softly | light | researching or looking |
| 1B | silent: open on the problem | the offer | light | quick question |

## Templates

**Email 1 (1A, transparent)**
> Hey {{first_name}}, saw someone from {{company_name}} checking us out.
> Are you looking into {{problem}} right now, or was it just research?
> {soft, no-pressure CTA}

## Examples

Adapted from the LeadBird approach:
- "Hey {{first_name}}, saw someone from {{company_name}} was on our site. Are you actively looking into {{problem}}, or just doing some early research? Happy to point you to the right thing either way."
