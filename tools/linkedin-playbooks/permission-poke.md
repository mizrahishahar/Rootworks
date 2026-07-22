---
type: playbook
vertical: [copy]
channel: [linkedin]
sources: intent list
---

# Permission-poke

Works off a live trigger, something they just did that earned the reach: a role posted, a signal fired. They declared the pain in public, so you do not pitch it back. You give them an easy out, poke the pain with one plain question, and stay unattached to the answer. The disarm is the move: a busy founder almost never hears "might be off here, ignore if not", so it stops the scroll. The trigger earns the open, the question earns the reply.

## The play

Name the trigger, disarm, poke one real thing.

Connect blank. Open on the trigger plainly so it reads one-to-one: "saw you're hiring on the infra side." Then the out, then one plain question about the SDLC pain the hire exists to fix, the devs pulled off shipping product to babysit deploys and fires. Never a claim they must accept, never a pitch. Short, one idea a message, the way a person actually DMs. Poke one pain and let them name it; go a layer deeper by question, not by telling. The next step comes late and soft, with a real out. Aim at the owner of the outcome, never the recruiter.

## Needs

- A live trigger per lead (a hiring signal, a fired intent event), screened as genuine.
- Expansion to the decision-maker by company size; recruiters and HR excluded.
- Vars: `{{first_name}}`, `{{company_name}}`. The trigger stays generic in copy, no exact-role token.

## Touches

Connection-gated.

- **Connection request** - blank.
- **Message 1** - the trigger, then the out, then one plain SDLC question. 2 variants.
- **Message 2** - a second poke a layer deeper, or a light nudge if quiet. 2 variants.
- **Message 3** - a soft, unattached offer of the next step, with a real out. 2 variants.

## Template

**Connection request** - blank

**Message 1** (on accept)

> Hey {{first_name}}, saw you're hiring on the infra side.
>
> Might be off, but is that because infra keeps pulling your devs off actually building the product?

**Message 2** (follow-up)

> Guessing the deploys and the random fires mostly land on whoever's closest right now?

**Message 3** (follow-up)

> All good if it's sorted {{first_name}}. If not, that's the whole thing we do, we take infra off the team so your devs stay on product. Worth a look?

## Examples

Different SDLC moments to poke in Message 1, one per variant:

> Hey {{first_name}}, saw you're hiring on the infra side. No idea if this is even it, but is the goal just to get your engineers off deploys and back to shipping?

> Hey {{first_name}}, saw you're hiring on the infra side. Might be reading it wrong, is it that the pipeline and the on-call keep landing on the product team?
