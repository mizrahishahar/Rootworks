# Alta

The deployment surface: how a LinkedIn sequence is expressed and taken live as an Alta campaign. Reference for the tool, not a procedure. Verify live values against the workspace at run time; treat specifics as a starting point, not live state.

## What Alta is

An AI-SDR platform. The AI writer is **Katie**; the message critic is **Luna**. A campaign runs LinkedIn, email, phone, SMS and WhatsApp from rep profiles, and can write per-lead copy from prompts or send authored templates. It is both a sourcing tool and the outreach destination.

## Campaign anatomy

Built in a fixed order: **Audience → Pitch → Touchpoints → Preferences → Launch.**

- **Audience** - who the campaign reaches. Sourced natively (classic filters, social signals, trigger events, ABM, LinkedIn connections) or handed in (CSV, webhook, chrome extension). The source locks at draft; an active campaign is relaunched, not re-sourced.
- **Pitch** - the selling points Katie writes from. Auto-generated from the workspace Knowledge Base and made campaign-specific. Editable fields: website name, pain points, value propositions, language. Tune it to the exact audience.
- **Touchpoints** - the sequence (below).
- **Preferences** - run mode, daily contact limits, active days and times, dedup, tracking and unsubscribe.
- **Launch** - go live.

## The touchpoint catalog

Build in Tree view for branching. Each gap between steps is an editable **wait**; `0 days` fires the next step the same day (e.g. the message the day a connection is accepted).

**LinkedIn steps:**
- **View profile** and **Like a post** - the warm touches, placed before the connection request.
- **Connection request** - blank note converts best and is safest.
- **LinkedIn message** - the DM.
- **Voice message** - a LinkedIn voice note. Two modes: *personalized* (AI generates unique audio per prospect) or *recorded once* (one clip to all, recorded in-app or uploaded audio). Hard cap 60 seconds. Requires an existing connection, so it must sit after a connection-request step.

**Conditions and branching:**
- **Check if connected on LinkedIn** - gate the message on acceptance.
- **AI Condition** - a yes/no prompt evaluated with web search, branches the tree (e.g. "Does {company} operate in healthcare?").
- **Custom Condition** - branches on structured engagement fields (opens, clicks) with operators and AND/OR.

**Other channels:** personalized or templated email, call, SMS, WhatsApp, manual task, API action, status update - available in the same tree for multichannel.

## Templated vs personalized steps

Every message step is one of two forms:
- **Templated** - authored copy with merge tags. You write the exact message. Right when the copy is fixed and human-written (the manual-template preference).
- **Personalized** - a prompt that directs Katie to write per-lead. You write the instructions, not the sentence.

The craft is identical; choose the form the campaign runs on and write in it.

## Steering the copy (personalized steps)

Copy is controlled through layered context, not one text box:

- **The per-step Prompt** is the primary lever, holding a **Goal** and **Instructions**. Structure a strong prompt as **Role / Context / Task / Format / Constraints**, one task per prompt. Punctuation is read structurally: double quotes for exact text, colons for sections, dashes for lists, CAPS for non-negotiables used sparingly ("DO NOT pitch in the first message").
- **Sliders set tone and length, never the prompt.** Formality, Persuasion, Urgency, Personalization, and Word count live in the control panel. Putting length or character counts in the prompt text causes misalignment - it is already controlled by the slider.
- **Input-data toggles** decide what Katie may use (first name, title, company name, company summary, city). Toggle a field off and it will not appear.
- **Variables** insert prospect, company, and signal fields, and the rep meeting link, via the `/` menu. **AI enrichment variables** add custom web-research fields (name, output type, a research prompt) reusable across steps.
- **Message scoring (Luna)** grades the rendered message out of ten on channel-specific criteria and suggests prompt additions; a saved winner goes to the prompt library. Use scoring to iterate, not as a ritual.
- **Refine** rewrites a prompt for clarity; **Global Instructions** apply brand voice and banned words across all messages.

## The Knowledge Base (the workspace source of truth)

Filled once, inherited by every campaign (per-campaign override). Sections: **Pitch** (the highest-leverage tab - company, description, pain points, value props, proof, competitors, default CTA), **Keywords** (feed trigger campaigns), **Signals** (weight the 17 buying signals as defaults), **Context** (reusable files Katie can pull from), **Messaging** (default voice, length, structure), **Connectors** (CRM, calendar, comms), **Prompts** (reusable prompt library). A stale Pitch leaks into every generated campaign; refresh on repositioning.

## Outreach style presets

At build, a preset seeds the touchpoint shape: Start from Scratch, Value-Laden, Themed, 3-Touch, **Social Selling** (LinkedIn-first), Direct Action. Social Selling is the LinkedIn-first starting point.

## Run mode

- **Auto-Pilot** (default) - Katie sends every touch automatically on schedule. All control is front-loaded into the prompt and pitch.
- **Co-Pilot** - every prospect waits for human review; approve or reject per step before it sends. Costs daily queue management, but gates message quality.
- Standard pattern: start Co-Pilot to validate quality, graduate to Auto-Pilot, fall back to Co-Pilot if reply rates drop.

## The Social Signals play (highest-converting LinkedIn motion)

The docs' strongest LinkedIn play: ~10-15% reply vs ~3-5% cold. Source people by LinkedIn activity - engaged with a specific post, a creator's audience, a company's page, or up to six keywords - and layer ICP filters until the preview reads balanced. Rules: **one signal per campaign**, refresh weekly (audiences decay), and **lead with their context, not yours** - the signal earns the opener.

## LinkedIn safety

Alta paces automatically (actions spaced 1-2 minutes, spread across the day) and enforces protective cooldowns (auto-reset after 14 days) when limits look near. LinkedIn limits every action type including messages to existing connections. Ramp gradually after inactivity; do not mix heavy manual activity with automation on the same account. A **personalized connection note is itself risk-raising** - a blank request is safer and converts better.

## Reply Agent

Closes the loop on inbound: a **Goal** prompt (behavioral, capped ~6,000 chars, with tools for calendar booking) and an **Outcome** set of mutually exclusive statuses (Qualified / Nurture / Not a fit) with classification criteria. Safe default: matter-of-fact tone, concise length. Used when inbound is handled inside Alta rather than handed to the inbox manager.
