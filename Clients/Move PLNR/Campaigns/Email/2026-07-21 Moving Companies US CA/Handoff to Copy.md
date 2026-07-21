# Handoff to Copy — 21.7.26 Moving Companies US CA (Recycle)

## What this batch is
A **recycle**, not a fresh pull: the public-inbox (company inbox) domains from the 06-01 and 06-16 builds, re-verified 2026-07-21. Every domain here was already mailed 1-3 times in June. **A resend will not earn a re-open — the angle must be genuinely new.**

## The segmentation and why
| Campaign | Filters | Size (raw / pre-verify) |
|---|---|---|
| Home Movers - Owner-Operators - Company Inbox | Employees 1-10, residential only | ~1,738 |
| Home Movers - Scaled Operations - Company Inbox | Employees 11-50, residential only | ~750 |

Residential-only because the evidence is one-sided: every positive this account has produced came from residential movers on the company inbox (all 10 of the 7.7 batch from Home OO Company Inbox; commercial = zero positives, twice). Size is the axis that changes the angle: at 1-10 the owner is the operator (leads sit while they're on a truck); at 11-50 the office is the ceiling, not the trucks.

## Evidence on what pulls (surface, not verdict)
- 23.6 Public campaigns, **3-step** sequence: 4.7% and 2.4% reply, positives present. 7.7's 2-step burned the list faster for less per lead.
- Client green-lit new product-led angles (07-12 beer meeting log): **insurance, bill/payments, temp-staffing, "full operating system."** These are the fresh reasons to re-open; the Cactus/Sam proof stack remains the baseline that has actually produced replies.

## True personalisation per segment
- Both: `company_clean`, `City`, `State`, `Country` (geo is personalisation here, not a segment).
- **No `first_name` — these are company inboxes.** Greeting-less openers, as the prior Public campaigns ran.
- 06-16 subset only (~27% of pool): `Segment Description` (subcategory like "Toronto Condo", "Long Distance") — usable only with a fallback.

## What's already screened out at export
Cross-table domain dedup · PlusVibe replied/bounced/unsubscribed · DNC · non-campaign-ready rows.
