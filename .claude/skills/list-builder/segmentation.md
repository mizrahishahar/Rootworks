---
type: knowledge
---

# Segmentation

Segmentation is not a step you do to a list. It is the campaign: how you slice the pool decides how many campaigns exist, what copy each can truthfully say, and which variables have to be on every row. Get it right and the copy writes itself, because the segment already made the message specific. The filters that express a segment are composed and verified by [[views-poweruser]]; this is the judgment about whether to split at all, and on what.

## Two conditions, both required

**Size:** the slice must be big enough to stand as its own campaign and read a real signal; fold thin slices into a broader campaign rather than starve a standalone one. **A reason:** the split must let the copy say something genuinely new to that audience. A slice that changes nothing in the message is not a segment, whatever the field values say - if you can't state the real reason a segment exists, it doesn't.

## Segmentation over personalisation

- A native segment out-pulls broad AI personalisation: slice so one specific line is honest for the whole segment. Two of three levers win a campaign - blue-ocean offer, very-specific targeting, no-brainer CTA - and the segment is how you buy "very-specific."
- The cheapest high-leverage field is the subcategory one level below the obvious category (a "{{roofing / HVAC}} contractor," not "a contractor"). It is captured at sourcing so the opening line can be true.
- Persona call-outs land at larger firms (~200+ employees); industry-subcategory call-outs land below that.
- Every variable is one of two things, and the test is whether its value changes the angle or just a word. Changes a word: it personalises, a merge field inside the campaign copy, splits nothing. Changes the angle: it marks a different audience, a segment, its own campaign.

## The two moments of design

Segments are designed twice, deliberately. At query scoping (see `scoping`), the segments a query split already implies are set, which secures the variables the pulls must carry. In the base, off Relevant + Found, the full set is drawn once the real distribution is readable: volumes per slice, field fill-rates, what is actually reachable. The count is emergent; never preset how many campaigns exist.

## The axes

No fixed set; read which axes actually separate this market into groups that need different copy:

- **Vertical or industry subcategory**, when value or language changes by vertical. Capture the specific subcategory, not the umbrella, so a line can be specifically true.
- **Company size or maturity.** At a one-to-ten-person company the owner is the operator; at larger firms persona and process language land. Size is a different audience, so size splits are campaigns.
- **Persona or title**, the decision-maker type; founder or owner status dominates functional title.
- **Channel**, a named contact versus a published role or public inbox. Different copy, different campaigns; the split arrives from the build, not from a field you compute.
- **Geography**, usually personalisation, not an axis, unless one geo stands alone.
- **Language**, a real axis in non-English markets; the contact name, not the company location, tells you who speaks it.
- **Deliverability (MX)**, the one axis that is not about copy: it splits by where a send can safely go, not by what the message says. The signal is the `MX Provider` column where the source carries it. Three classes: **sendable** - the normal inboxes (google, microsoft, zoho, self-hosted mail); **gateway** - a secure email gateway fronts the mailbox (Mimecast, Proofpoint, Barracuda, Cisco/IronPort, Sophos and kin), corporate filters that eat or bounce cold email in bulk; **dead** - `no_mx`, `errdomain`, invalid MX, no mailbox exists, a guaranteed bounce that never exports. The doctrine is Nick Abraham's two-phase rule: in a bounce spike, stop sending to gateways entirely; in steady state, segregate them into their own campaign per segment, same copy, so their bounce behavior reads in isolation and only that campaign gets paused when its bounce rate climbs. Gateways are fenced, not excluded, and a gateway split never changes the copy; different copy for a gateway slice means a deliverability fence has been confused with an audience.

## The brake, and its asymmetry

The drive is maximum specificity; the brake is volume. The grid of company axis against persona axis shows which cells stand and which merge. Watch the depth asymmetry: some roles are structurally scarce per company, so a thin persona grows only by net-new companies, not by pulling deeper.

## Variants are not campaigns

Variants live inside a campaign to test angles against the same audience. Different copy to a different audience is a different campaign, never a variant; reaching for variants when you have two audiences quietly corrupts the read on what works.

## Every segment must sum to its parent

Once the segment set is decided, [[views-poweruser]] verifies that every segment's exact count sums to Relevant + Found's exact count precisely, before any view is cut. A segment set that doesn't reconcile isn't finished, whatever the individual counts look like.
