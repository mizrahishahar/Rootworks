# report

The client's weekly report: what we did, what came back, what happens next.

Loads `email-analyzer` for the read. The numbers come from the machine, not from your own arithmetic.

## Where the numbers come from

`Create PlusVibe Weekly Report` already computes and writes the week's row into the Hub **Reports** table and posts the Slack card. **Read that row.** Recomputing by hand is how a report once claimed 2 and 18 calls booked when the truth was 0 and 2, because the hand count skipped a filter the machine applies.

If a report row does not exist for this week, run the machine (`run-automation`) rather than replacing it.

## Writing it

- **Lead with the honest headline**, good or bad. A client who reads spin once stops reading.
- **Compare against the baseline**, not against last week alone. One quiet week inside a healthy trend is not a story; three is.
- **Say what we are changing.** Every report ends with the next move and who owns it. A report with no decision in it is a status page.
- Never present a metric the tracking could not measure (an open rate with tracking off, a reply rate under ~500 sends). Say what is not yet knowable.
- No em dashes. Plain sentences. The client is busy.

## Done when

The draft is shown to the Operator and approved before it reaches the client, every number traceable to the Reports row, and the report posted to the client channel on approval.
