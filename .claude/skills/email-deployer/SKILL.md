---
name: email-deployer
description: Takes an approved email sequence live cleanly, and designs the sending workspace it runs on. Holds how a new campaign is built and how an email workspace is set up. Use when deploying an email campaign, or standing up a client's sending workspace.
type: skill
vertical: [copy]
---

# Email campaign deployer

You take an approved email sequence live cleanly, and you design the sending workspace it runs on. You work through an email sender, [[plusvibe]] by default.

## New campaign

Everything it takes to build and configure one campaign. The approved sequence taken live as a draft, with nothing about its essence touched.

- **The sequence goes in as approved** - the touches in order, the variants as planned, follow-ups threaded under the first email with no new subject, waits in days exactly as approved.
- **Campaign name** `{D.M.YY} - {segment descriptor}`, from the campaign folder.
- **Register every var before you build.** Confirm each token the copy uses exists as a field on the sender. Some vars cast (`company_clean` into `company_name`); that is fine. Create any missing var natively, without a prefix, so it renders as `{{var}}` and not `{{custom_var}}`. Reconcile by whether the var is registered, never by hardcoded names.
- **Map every placeholder to a real, populated field** before launch; an empty or unmapped variable renders blank and burns the send.
- **The essence is fixed** - deployment adds only the mechanics below, never meaning. The copy that was approved is the copy that sends.
- **Signature inserted** from the sending inbox, `{{sender_signature}}`, with a blank line between the body and the sign-off. You insert the signature the inbox already carries; the format is a workspace matter, below.
- **Spintax** - function words only, three options to a spin, never two (`{{random|Hey|Hi|Hello}}`). Never the offer, the proof, or the CTA; a spin that shifts meaning is worse than none.
- **Schedule** - Monday to Friday, 07:00 to 14:00 in the client's timezone.
- **Limits are set by inbox rate, never by the campaign.** The per-inbox daily limit (warmed range, ramped) is the only real throttle; the campaign-level daily limit is set high (5000) so it never binds. A campaign cap fights the inbox ramp and hides the true capacity.
- **Stop on reply at the domain**, not just the lead. A "no" belongs to the company; the email that gets reported is the one their colleague gets next week.
- **Unsubscribes auto-added to the blocklist**, so the list defends itself as it runs.
- **Blocklist by domain**, except where the address sits on a consumer ISP (`bellsouth.net`, `gmail.com`), where you blocklist the address or you block strangers. Never blocklist a positive reply, and never a reply you have not read. Only a confirmed no.
- **Dedup before upload.** The sender does not dedup across campaigns: the same person in two campaigns is mailed twice, from two inboxes. `ws_last_sent_at` is per-record and reads null on a freshly loaded lead no matter how many times that person has been mailed, so it is never a dedup check. Dedup before upload or not at all.
- **Build as a draft.** The Operator loads the leads and flips the campaign live; you never launch unasked.
- **Verify by read-back, never by response code.** The platform returns success while silently dropping accounts that no longer exist, and a campaign's status can flip on an unrelated write. After every write, read the setting back and count what actually landed. Never change a campaign's status to match your expectation - if the state is not what you left, the Operator moved it, so ask.

## New workspace

How a client's sending workspace is designed. Done once, at setup, and it is what every campaign then draws on.

- **Tag the inboxes into waves.** The client's sending inboxes are tagged as a set, `{client}-{n}`; a domain's inboxes travel together (both, or neither). A campaign sends from a named wave.
- **The signature format** - what a good signature is, set on each inbox so `{{sender_signature}}` renders it. Plain text, human, the kind a real person ends an email with: a sign-off, the sender's real name, the company, a real physical mailing address, and a plain opt-out line. The address is not optional: CAN-SPAM requires a valid postal address on every commercial email, so a signature without one is not shippable. Use the client's real address, never a borrowed one. No images, no logos, no banners, no tracked links.

	Thanks,
	{{sender_first_name}} {{sender_last_name}}
	{company}
	{physical mailing address}

	P.S. not relevant? just reply "no thanks"

- **Configure the DNC blocklist.** The client's Do-Not-Contact list, and every not-interested reply, loaded into the workspace blocklist as domains at setup and as the workspace runs. A hand-scrub protects one build; the blocklist protects every build after it. Consumer-ISP addresses go in as addresses, not domains.

---

- **Live settings at run time are the truth**; stale values are not.
- **On any sender error, stop and ask the Operator to refresh** - never retry in a loop.
