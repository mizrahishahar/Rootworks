# ContaGen

**Kind:** open-web contact finder. A fallback reached at the gaps — when the indexed contact databases cap on a niche (owner-operated, local, blue-collar; people with no LinkedIn presence). The operator runs it, multi-pass, on the gap domains.

## Query output
The **gap domains worth a run** — the highest-value companies that came back with no contact. You pick them; the operator runs the generation.

## CSV output
Contacts folded back onto those gap rows: **names reliably, role inboxes more than direct emails.** The name still powers personalization and email pattern-guessing (test firstname@domain and friends with a bounce-checker; Gmail addresses are largely unguessable).

## What it is

DiscoLike's BYOK contact generation: web search that finds people the indexed databases never hold. Multi-pass with different search engines and a capable model (cheap models yield poorly; in the movers demo Grok+Serper found ~51/100 companies where LinkedIn-sourced data found near zero).

## Exhaustion is real

If it returns nothing for a set of companies, they are below scraping visibility. Re-running will not change it — accept the gap or go manual (LinkedIn by hand). Never keep re-running the same domains.
