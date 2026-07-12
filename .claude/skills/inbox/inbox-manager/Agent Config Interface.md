# Agent Config Interface

The Agent Config is the one self-contained prompt that runs inside PlusVibe and writes the FIRST automated reply to an interested lead, in the seconds before a human inbox manager can touch the thread. It is the inbox manager working alone, so the first attempt to reply is still fire. PlusVibe injects the thread, and the agent can read the calendar.

Because the live skill is not available to it, the Agent Config is a condensation. It presses everything the inbox manager knows and needs for this company into one prompt:

- the skill: the judgment, the two-step reply, the booking mechanics, the voice and the never-list, condensed to what a first reply needs
- the Company Overrides: the prospect-specific instructions
- the Assets: the value it can deploy, the actual links it may send
- the company knowledge: the onboarding facts, the proof numbers, the objection answers

It is generated from those sources, never authored as a parallel rulebook. When the skill, the overrides, or the assets change, the Agent Config is regenerated so it never drifts from them.

Location: Prospects/{Client}/Assets/INBOX-MANAGEMENT/Agent Config.md

## What it contains
One prompt, self-contained, with these parts: who you are (the sending persona), the single goal (book the call), what the company is and its proof, how to reply (the two-step), at least one worked example of a positive reply, the voice and never-list, objection handling, booking, and the guardrails.

## Building it well
- Condense, do not dump. Carry only what a first reply needs; the agent is fast and brief, not a manual.
- The two-step is the spine: fulfill what was promised or asked, then earn the call with a for-them reason and two specific real times. The agent reads the calendar, so it offers real times in the prospect's timezone, never a calendar link, never an invented duration.
- Always include a worked example of a positive reply (fulfill the lead magnet, then the reason and the two times), drawn from what actually wins for this company.
- Pull the proof and the objection answers from the onboarding form and Assets; pull the do and do-not from the Company Overrides; never let it contradict them.
- Guardrail the failure modes: never invent facts, numbers, durations, or a booking, and never claim a call is locked until the invite has actually gone out.
- Self-contained: written so PlusVibe can run it with only the thread it injects, no tools or external context assumed beyond the calendar it can read.