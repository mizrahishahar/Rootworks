Teaches: the standard every campaign on the sender is held to. Any job that creates or changes a live campaign, whatever it is called, conforms to this.

# The deployment standard

Not a procedure, a state of the world. A campaign on the sender is correct when it satisfies all of this, and any touch that leaves one out of conformance is unfinished work. Everything here is done directly through the MCP.

## Settings are approved, not assumed

Before any campaign is built or changed, its settings are shown for approval as a labeled list: name, sequence shape, inboxes, schedule, limits. The Operator changes them often; showing first is cheaper than rebuilding.

## The standard

**Name.** `{YYYY-MM-DD} - {Market / Niche} - {Segment} - {playbook}`. Always `YYYY-MM-DD`.

**Sequence.** Exactly as approved: touches in order, follow-ups threaded under the first email with no new subject, waits in days exactly as approved. Body is the deploy-ready block, spintax inline; the sender never gets words that were not approved.

**Inboxes.** Gateway campaigns send only from the clean, SURBL-free set. Main campaigns run the full set the other production campaigns are running at the time. Which inboxes those are is read live, never remembered.

**Variables, registered before building.** Every token the copy carries must exist as a field on the sender. Custom variables store with a `custom_` prefix; create missing ones natively so they render as `{{var}}`, not `{{custom_var}}`. An unmapped variable renders blank and burns the send.

**Signature and P.S.** `{{sender_signature}}` renders the inbox's signature; blank line before it. A P.S. goes AFTER the signature, never before: body, blank line, signature, blank line, P.S.

**Schedule.** Monday to Friday, two windows in the client's timezone, 07:00-10:00 and 15:00-18:00, via advanced scheduling (`use_adv_schedule: true`, `adv_schedule.windows` per day, both `daily_limit` and `daily_limit_new_lead` required), unless the client's `overrides` row says otherwise. Overrides are read every time.

**Limits live on the inbox, not the campaign.** The campaign daily limit sits high (5000) so it never binds the inbox ramp.

**Replies and unsubscribes.** Stop on reply at the DOMAIN, not the lead. Unsubscribes auto-add to the blocklist.

**Draft first.** Campaigns are built as drafts; the Operator flips them live.

## The Hub row

Every campaign on the sender has exactly one row in the Hub Campaigns table, matched on `Campaign ID`. The nightly sync discovers campaigns on its own, so the row may already exist: match, never duplicate.

- `Campaign` = the same name · `Campaign ID` = the sender's id · `Sequencer` = PlusVibe · `Channel` = email · `Client` = the registry link.
- `Campaign Copy` = the sequence as a client would read it. **This field is client-facing.** No mechanics, no status notes, no inbox counts, spintax stripped (base options rendered).

The field is written in the copywriter's rendering, exactly this shape (real tokens, shared bodies written once, Hebrew as it ships, RTL):

```
### Email 1

**Variant A**  ·  _the qualifier_  ·  _Subject:_ net revenue at {{company_name}}

> Hey {{first_name}},
>
> the body.

**Variant B**  ·  _body B_  ·  _Subject:_ {{company_name}} online reputation
**Variant C**  ·  _body B_  ·  _Subject:_ question about {{company_name}}

> the body, once.

---

### Email 2

_Threaded, +2 days_

> the body.
```

## Leads

Leads reach a campaign through the Deploy View to PlusVibe Campaign automation, never by hand upload. The view is the control surface: every visible column filled or the row is held back. The dedupe mode is a launch decision (Strict is the default and means never re-email the touched); a looser mode is chosen only when re-contact is the intended play.

## Conformance is verified by read-back

A touch is done when the campaign has been read back OUT of the sender and the sequence, variables, schedule, and accounts that actually landed match the approved settings, and the Hub holds exactly one row for that Campaign ID. The platform returns success while silently dropping settings; the read-back is the proof.
