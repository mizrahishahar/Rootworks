---
type: playbook
vertical: [copy]
channel: [email]
sources: standard list
---

# Name-drop

A modifier, not a campaign: drop a relevant senior colleague's name to lift the reply. It overlays a base playbook; it never runs alone.

## The play

Add a name, hand them an easy forward.

- **The line** - a conditional line or PS on the base email: "wasn't sure if this sits with you or {{colleague_name}}, whoever owns {{area}}." It signals homework and hands them an easy forward.
- **Skip on a miss** - drop the line entirely when no colleague is found; a blank or wrong name is worse than nothing.
- **Always test with-vs-without** - it is a lift, not a certainty, and it costs a data layer.
- Everything else follows the base playbook.

## Needs

- A colleague layer on the list: a same-company contact a seniority above the target.
- The base playbook this modifies (default, case-study-led, ...).
- Var: `{{colleague_name}}`.

## Subject lines

Unchanged from the base playbook; the name-drop lives in the body or PS.

## Touches

None of its own. It overlays the base playbook's touches; the name-drop line is added as one tested variant against a clean control.

## Template

**PS or inline line (added to any base email)**

> PS, wasn't sure if this is more your call or {{colleague_name}}'s, whoever owns {{area}} over there.

## Examples

> ...Worth a quick look?
>
> PS, wasn't sure if you or {{colleague_name}} owns pipeline over there, feel free to point me the right way.
