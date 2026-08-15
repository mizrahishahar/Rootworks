# deploy-to-plusvibe

Take an approved, spun sequence live in PlusVibe, and register it in the Hub.

Reads `tools/plusvibe.md` first for the platform's traps. Runs after `spintax`. Never invents copy: what was approved is what sends.

## 1. Build the campaign

- **Name:** `{YYYY-MM-DD} - {Market / Niche} - {Segment}`. Always `YYYY-MM-DD`.
- **Sequence as approved:** touches in order, follow-ups threaded under the first email with no new subject, waits in days exactly as approved.
- **Register every variable before building.** Confirm each token the copy uses exists as a field on the sender; create missing ones natively so they render `{{var}}`, not `{{custom_var}}`. An unmapped variable renders blank and burns the send.
- **Signature** from the inbox (`{{sender_signature}}`), blank line before it. **A P.S. goes after the signature**, never before: body, blank line, signature, blank line, P.S.
- **Schedule** Monday to Friday, 07:00-14:00 in the client's timezone, unless their `overrides` row says otherwise.
- **Limits live on the inbox, not the campaign.** Set the campaign daily limit high (5000) so it never binds the inbox ramp.
- **Stop on reply at the domain**, not the lead. Unsubscribes auto-added to the blocklist.
- **Build as a draft.** The Operator flips it live. You never launch unasked.

## 2. Register it in the Hub

Create the row in **Campaigns** (`tblbVPakE4n16ob7Y`), or update it if the nightly sync already discovered it: match on `Campaign ID` and never create a second row for one campaign.

- `Campaign` = the same name, `Campaign ID` = PlusVibe's id, `Sequencer` = PlusVibe, `Channel` = email, `Client` = the registry link.
- `Campaign Copy` = the sequence as a client would read it: touches and waits, spintax stripped. **This field is client-facing.** No mechanics, no status notes, no inbox counts.

## 3. Leads

Leads land through the **Deploy View to Campaign** machine (`run-automation`), never by upload. The view is the control surface: every visible column must be filled or the row is held back.

## Done when

You have **read the campaign back out of PlusVibe** and confirmed the sequence, variables and schedule that actually landed, plus the Hub row exists with exactly one row for that Campaign ID. Never trust a success response; the platform returns success while silently dropping settings.
