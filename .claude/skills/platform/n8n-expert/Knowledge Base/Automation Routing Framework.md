# Automation Routing Framework

The most important judgment in Flowroots automation. Routing to the wrong layer creates dead automations (too much judgment in n8n) or wasted Shahar time (things that should run themselves).

---

## The Four Layers

### n8n
Trigger-based, deterministic, unattended. Runs while Shahar sleeps.
Test: can this run without any human involvement, every time, with no judgment calls?
Examples: sync emails to Airtable, initialize prospect folder, enrich contacts on booking, push a meeting recording to Drive

### Claude Code
The Flowroots process system — skills + SOPs + commands. Conversational, judgment-heavy, Shahar-driven.
Test: does Shahar need to read, react, or decide at any point during this process?
Examples: /build-list-fresh, /pull-client-info, /log-client-session, writing cold emails, defining an ICP, reviewing a prospect, writing a check-in. These are all Claude Code sessions — they are invoked commands backed by skills and SOPs.

### Manus / Autonomous Co-work
A fully autonomous web agent that can navigate browsers, fill forms, and operate the web without Shahar. Use very rarely. Only when the task requires real browser interaction that cannot be done via API, and judgment is not required. The bar is high — default to n8n or Claude Code first.
Examples (hypothetical, barely used): scraping a site that blocks API access, automating a web form submission on a platform with no API, multi-step browser workflows on external tools.
Warning: Manus has no persistent state between sessions and no integration with the vault. Do not route anything to Manus that requires reading or writing vault/Airtable data — n8n owns that.

### Manual
One-off, relationship-sensitive, high-stakes, or too ambiguous to automate.
Test: could this go wrong in a way that damages a relationship or costs money if it misfires?
Examples: first LinkedIn DM to a D100 target, responding to a positive cold email reply, sending a contract

---

## Routing Decision Tree

1. Does it have a clear, unambiguous trigger? (webhook, schedule, form, record change)
   - No → not n8n. Is it a process Shahar runs deliberately? → Claude Code. One-off? → Manual.
   - Yes → continue

2. Does it require human judgment at any step?
   - Yes → Claude Code
   - No → continue

3. Does it require real browser navigation (not achievable via API)?
   - Yes → consider Manus, but be very cautious — confirm no n8n HTTP Request alternative exists first
   - No → continue

4. Is the output deterministic and writable to a system? (Airtable, Drive, Obsidian)
   - No → Claude Code
   - Yes → n8n

---

## Warning Signs

**This belongs in Claude Code, not n8n:**
- 'It depends on what the email says' — that is judgment
- 'Shahar should review before it sends' — that needs a human
- 'Sometimes we do X, sometimes Y based on the context' — branching on judgment, not data
- The output is a document Shahar will edit — write it in Claude Code, not n8n

**This belongs in n8n, not Claude Code:**
- 'We do this same thing every time a booking comes in' — automate it
- 'Shahar manually copies this from one system to another' — pure sync, n8n owns it
- 'This runs every day at the same time' — schedule trigger
- 'Every new Airtable record needs this enrichment' — webhook trigger

**Do not route to Manus unless:**
- You have confirmed there is no API for the target platform
- The task requires no judgment
- The output does not need to land in Airtable or the vault