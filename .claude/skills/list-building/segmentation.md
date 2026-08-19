Teaches: whether a pool splits into more than one campaign, on what axis, and the deliverability fence. The judgment of the split; expressing it as filters and views is table craft.

# Segmentation

Segmentation is not a step you do to a list. It is the campaign: how you slice the pool decides how many campaigns exist, what copy each can truthfully say, and which variables have to be on every row. Get it right and the copy writes itself, because the segment already made the message specific.

## Start from the brief, not the fields

Listen to the context the Operator gives: the offer, the angle being tested, which campaigns already exist, what they want to learn. A segment set drawn from field values alone produces slices nobody can write copy for. If the brief does not say, ask before slicing. The count of campaigns is emergent, never preset.

## Two conditions, both required

**Size:** the slice must be big enough to stand as its own campaign and read a real signal; fold thin slices into a broader campaign rather than starve a standalone one. **A reason:** the split must let the copy say something genuinely new to that audience. A slice that changes nothing in the message is not a segment, whatever the field values say. If you can't state the real reason a segment exists in one sentence, it doesn't.

## Segmentation over personalisation

- A native segment out-pulls broad AI personalisation: slice so one specific line is honest for the whole segment. Two of three levers win a campaign, blue-ocean offer, very-specific targeting, no-brainer CTA, and the segment is how you buy "very-specific."
- The cheapest high-leverage field is the subcategory one level below the obvious category (a "{{roofing / HVAC}} contractor," not "a contractor"). It is captured at sourcing so the opening line can be true.
- Persona call-outs land at larger firms (~200+ employees); industry-subcategory call-outs land below that.
- Every variable is one of two things, and the test is whether its value changes the angle or just a word. Changes a word: it personalises, a merge field inside the campaign copy, splits nothing. Changes the angle: it marks a different audience, a segment, its own campaign.

## The two moments of design

Segments are designed twice, deliberately. At query scoping (see `scoping.md`), the segments a query split already implies are set, which secures the variables the pulls must carry. In the base, off the relevant-and-found pool, the full set is drawn once the real distribution is readable: volumes per slice, field fill-rates, what is actually reachable. Group by a candidate field and read its real distribution before proposing a split on it; a field with 80% blanks is not an axis.

## The axes

No fixed set; read which axes actually separate this market into groups that need different copy. Expect the sharp angle to come from company fields more often than people assume, because that is what lets a first line be specifically true.

- **Vertical or industry subcategory**, when value or language changes by vertical. Capture the specific subcategory, not the umbrella.
- **Company size or maturity.** At a one-to-ten-person company the owner is the operator; at larger firms persona and process language land. Size is a different audience, so size splits are campaigns.
- **Persona or title**, the decision-maker type; founder or owner status dominates functional title.
- **Company facts the rows carry**: platform, plan tier, tech stack, business model, revenue band, store age, a rating the reader owns. Whichever of these changes what the first line can truthfully say.
- **Channel**, a named contact versus a published role or public inbox. Different copy, different campaigns; the split arrives from the build, not from a field you compute.
- **Geography**, usually personalisation, not an axis, unless one geo stands alone.
- **Language**, a real axis in non-English markets; the contact name, not the company location, tells you who speaks it.
- **Deliverability (MX)**, the one axis that is not about copy, below.

## The deliverability fence

The MX axis splits by where a send can safely go, not by what the message says. The signal is the `MX Provider` column where the source carries it; no field, or mostly blank, means skip the fence and say so. Three classes: **sendable**, the normal inboxes (google, microsoft, zoho, self-hosted mail); **gateway**, a secure email gateway fronting the mailbox (Mimecast, Proofpoint, Barracuda, Cisco/IronPort, Sophos and kin), corporate filters that eat or bounce cold email in bulk; **dead**, `no_mx`, `errdomain`, invalid MX: no mailbox exists, a guaranteed bounce that never exports.

The doctrine is Nick Abraham's two-phase rule: in a bounce spike, stop sending to gateways entirely; in steady state, segregate them into their own campaign per segment, same copy, so their bounce behavior reads in isolation and only that campaign gets paused when its bounce rate climbs. Gateways are fenced, not excluded, and a gateway split never changes the copy; different copy for a gateway slice means a deliverability fence has been confused with an audience.

Applying it:

- The fence is drawn **per segment**, not once for the pool: every segment gets the gateway filter and its exact complement, same copy on both sides.
- Providers verified in real data: `proofpoint`, `barracuda`, `mimecast`, `sophos`, `mailroute`, `spamhero`, `appriver`, `spamexperts`. Match on `contains`. Always define sendable as NOT-gateway, never as an allow-list of known-good providers: `office365.us`, `amazon`, `fastmail`, `infomaniak`, `netcore`, `stackcp`, `hostinger` and self-hosted MX are all real sendable values, and an allow-list silently drops every provider it has not heard of.
- A gateway slice around 2-5% or less is too thin to read a bounce signal. Raise it rather than quietly cutting it; whether it earns the split is the Operator's call.

## The brake, and its asymmetry

The drive is maximum specificity; the brake is volume. The grid of company axis against persona axis shows which cells stand and which merge. Watch the depth asymmetry: some roles are structurally scarce per company, so a thin persona grows only by net-new companies, not by pulling deeper.

## Variants are not campaigns

Variants live inside a campaign to test angles against the same audience. Different copy to a different audience is a different campaign, never a variant; reaching for variants when you have two audiences quietly corrupts the read on what works.

## Priority: the second judgment of the set

Segments overlap in reality even when their reasons are clean: one lead can qualify for two, and a lead qualifying for none still has to deploy somewhere. So every segment set carries a second judgment beside the split itself: **the priority order**. Which campaign deserves a lead that qualifies for two is a call about the offer and the angle (the sharper, more specific argument usually wins the lead), made with the Operator, never defaulted. The set then deploys as a prioritized cascade with a catch-all at the bottom, so every relevant lead lands in exactly one campaign and none land in zero. Expressing that cascade as views is table craft; deciding the order is this skill's job.

## How to show it

A proposed segment set is one real markdown table (never inside a code fence), rows in priority order, the reason column carrying the sentence that justifies the split:

| Priority | Segment | Axis | The reason (what the copy can now say) | Est. size | Gateway slice |
|---|---|---|---|---|---|

Under it, three labeled lines: **Overlaps:** where segments can collide and who wins the lead. **Folded:** the slices deliberately merged and why. **Open:** anything waiting on the Operator's call.

## What a segment set becomes

The set's final form in the base is views: a prioritized cascade of deploy views plus the aggregate they sum to, a joint job with the table craft, which owns the exact filters, the counting, and the reconciliation. A segment is real only once its view holds an exact filter and the set sums to its parent precisely. Never create a field just to segment on: when the split you want has no field to express it, either raise the missing variable as a genuine gap (see `enrichment.md`) or let the rows classify themselves through an AI field, and then a plain filter does the rest.
