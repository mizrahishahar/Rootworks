---
Type: Campaign Sequence
client: Dave.io
segment: Hiring Signal (intent)
channel: LinkedIn (Alta)
updated: 2026-07-22
---

# Hiring Signal — Sequence (LinkedIn)

**Audience:** infra decision-maker (founder / CTO / VP Eng / Head of Infra) at a US company posting an infra hire. Signal + wiring in `Intent Trigger.md`. Sender: Alta.

**A/B:** two arms, one per playbook — same SDLC pain, different open. Arm A `pain-point-poke` (no cushion), Arm B `permission-poke` (disarm first). One arm per lead; split the audience.

**Voice (locked):** linkedin-setter register — plain, human, short, one idea a message. Ground on the signal, ask a real question, poke one SDLC pain (devs pulled off building the product to babysit deploys, the pipeline, fires, cloud cost). Do NOT center the "2am call" / on-call angle (Sean). Casual and unneedy, but grammatically complete and correct — full words, articles in place, a capital at every sentence start (Sean's bar). Never tell, never pitch before the pain is named. Generic signal ("hiring on the infra side"), no exact-role token. Human in the loop, never "real engineer"/"capacity"/read-only. Frame the offer as helping them scale without adding DevOps headcount; do NOT say "AI" in the copy, lead human ("we help"). No em dashes. The offer stays behind the poke; the teardown is the only ask, soft, at message 3.

---

## Arm A — pain-point-poke

**Connection request:** blank.

**A1 — opener (on accept)**
Hey {{firstName}}, I saw you're hiring on the infra side. How much of your engineers' week is actually going to infra right now, instead of building the product?

**A2 — follow-up**
The deploys, the pipeline, the random fires. I'm guessing all of it lands on the people you'd rather have building the product?

**A3 — breakup**
If it's handled, ignore me {{firstName}}. If not, we help you scale without adding DevOps headcount, so your engineers stay on the product. Want me to map where it'd help most at {{companyName}}?

---

## Arm B — permission-poke

**Connection request:** blank.

**B1 — opener (on accept)**
Hey {{firstName}}, I saw you're hiring on the infra side. I might be off here, but is that because infra keeps pulling your devs off the product?

**B2 — follow-up**
I'm guessing the deploys and the random fires mostly land on whoever's closest right now?

**B3 — breakup**
All good if it's sorted {{firstName}}. If not, we help you cover infra without the DevOps hire, so your devs stay on the product. Worth a quick look at where it'd save you?
