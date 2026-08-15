---
type: playbook
vertical: [copy]
channel: [linkedin]
sources: standard list or intent list
---

# Question-kickstarter

One message. One question, built off the one thing we already know about them, sent only once they accept. The reply lands in the inbox and the setter works it live. On LinkedIn we barely send messages, so the opener's only job is to start the conversation, never to carry it.

## The play

One fact, one question, then get out of the way.

- **The fact comes from the list, not the copy.** Segmentation already established what we know about this person: something they lack, something they just did, something that lands on one of them. That is where the specificity comes from, and the copy never manufactures it.
- **One message by design.** No sequence, no value message, no breakup. The question is the whole campaign. Everything after the reply is the setter, working the thread live.
- **Connection-gated.** Blank request, the question on accept. The accept is the first yes, and it is what makes one message enough.
- **Answerable in one line.** Low effort to reply is the entire mechanic. If it takes thought to answer, it does not get answered.
- **A question, never a claim.** State the fact plainly, then ask about their world. You are not walking them to a conclusion.
- **First name only.** No company token, no second variable. One line carrying two merge fields reads as a template no matter how good the question is.
- **The lead is ours from the reply on.** It goes to the inbox, we read what came back, and the next move is decided there. Nothing downstream is scripted in advance.

### The shapes

A repertoire, not a lookup. The fact suggests a shape and never dictates one; choose on what the fact will bear and on what you want back.

- **Who handles it.** For a fact that is an absence, or a job nobody owns. Makes them name a person, and often the person is them.
- **Open, no assumption.** For a fact that is public and thin. Ask how it is going and nothing more. Lowest risk of the four, and it still lands if we have read the situation wrong.
- **Binary, one option loaded.** For a fact specific enough to land on a person. Two options where one of them names the pain. The easiest to answer, because they are picking rather than composing.
- **Confirm.** For a fact we inferred. State it and ask whether it is right. A correction is still a reply, and a correction tells you more than a yes.

### The cushion

How certain the fact is decides how much cover the question needs.

- **Hard and verifiable** - ask straight. A cushion on a certain fact reads as hedging, and hedging on something they know you can see is worse than saying nothing.
- **Inferred** - cushion it. "Might be off here", "correct me if I've got this wrong". The out is what makes a wrong guess survivable instead of disqualifying.

## Needs

- One fact per lead, established on the list and true of this person.
- The decision-maker who owns the outcome, never the person merely adjacent to the fact.
- Base personalization: `{{first_name}}`, and nothing else.

## Touches

One. Connection-gated.

- **Connection request** - blank.
- **Message 1** - the fact in a line, then the question. 2 to 4 variants, one per fact the list can segment on.

No scheduled follow-up. A quiet thread is the setter's call, not a touch on a timer.

## Template

**Connection request** - blank

**Message 1** (on accept)

> Hey {{first_name}}, {the fact, stated plainly}. {the question}

## Examples

One client's application of the four shapes, where the segmentation had already split the list by what it knew (Dave.io, infra ownership).

**Who handles it**

> Hey {{first_name}}, noticed you don't have anyone dedicated to infra yet. Who ends up dealing with it when something needs attention, you?

**Open, no assumption**

> Hey {{first_name}}, saw you're hiring for an infra role. Can I ask how that's going for you?

**Binary, one option loaded**

> Hey {{first_name}}, saw you've got one person carrying infra right now. How's that going for them, drowning or manageable?

**Confirm, cushioned**

> Hey {{first_name}}, might be off here, but guessing infra lands on whoever's closest when something breaks. Is that about right?
