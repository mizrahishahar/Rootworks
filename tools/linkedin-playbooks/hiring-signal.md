---
type: playbook
vertical: [copy]
channel: [linkedin]
sources: intent list
---

# Hiring-signal

A job post is a company telling you where it hurts. Anchor to the exact role and the gap it leaves open right now, aimed at the decision-maker who owns the outcome, never the recruiter filling the seat. Intent is high, because they just declared the need in public.

## The play

Name the role, then the ramp-gap.

Connect blank, then open on the role in the first message so it is unmistakably not mass outreach: "saw {{company_name}} just posted a {{role}}." Name the ramp-gap pain, the offer as the faster path to what the hire is for: "instead of waiting three months for them to ramp, we start {{outcome}} this week." Aim by company size, Founder at a small shop, Head or Director at mid, VP at enterprise; the recruiter is a dead end.

## Needs

- A weekly job scrape, filtered to the past 7 days and the target roles.
- Expansion to the decision-maker by company size; recruiters and HR excluded.
- Vars: `{{role}}`, `{{company_name}}`, the `{{function}}` the offer covers.

## Touches

Connection-gated.

- **Connection request** - blank.
- **Message 1** - the role, named, and the ramp-gap. 2 variants.
- **Message 2** - value or a soft exit. 2 variants.

## Template

**Connection request** - blank

**Message 1** (on accept)

> Hey {{first_name}}, saw {{company_name}} just posted a {{role}}.
>
> A lot of teams bring us in to handle {{function}} while the new hire ramps, so instead of waiting three months, you start {{outcome}} this week.
>
> Worth a quick chat?

**Message 2** (follow-up)

> {a piece of value, or a soft exit that leaves the door open}

## Examples

> Hey {{first_name}}, saw {{company_name}} just posted a {{role}}.
>
> A lot of teams in your space bring us in to handle outbound while the new hire ramps up. Instead of waiting 3 months for the new rep to ramp, we start filling your pipeline this week.
>
> Worth a quick chat?
