# Campaigns

A campaign is one offer, sent to one segment, through one sender.

It is built on the sender. The sync makes it a row in the Hub Campaigns table. From then on it is managed from that row:

- **Stage** says where it is in its life
- **Live View ID** says which segment feeds it

## Stages

Every campaign is in exactly one Stage.

**Test**
- holds 1,000 leads
- passes at 1,000 contacted with at least 1 positive reply on email, 3 on LinkedIn. Then Scale
- fails at 1,000 contacted with fewer. Then Killed

**Scale**
- holds 3,000 leads
- at 3,000 contacted it is judged against the client's other campaigns on contacts per positive. Then Run or Killed

**Run**
- no total
- fed every day to the run cap

**Killed**
- not fed, not reported
- the sender is not touched; the campaign finishes what it holds

Test to Scale and Test to Killed are automatic. Every other move is a decision.

## Numbers

- **Contacted** is the only number a line is read against
- **Leads** is never a line; the sender counts leads loosely and contacted tightly
- **Positive replies** are the sender's own count
- **Contacts per positive** is contacted divided by positive replies. Lower is better. It is the one number two campaigns are compared on

## Feeding

- **Managed:** carries a Stage
- **In play:** Stage is Test, Scale or Run, and sender status is not PAUSED, DRAFT or STOPPED. COMPLETED is in play, because a view-fed campaign completes whenever its view runs dry and must start again when it fills
- **Fed:** in play, with a Live View ID, once a day

A run sends the stage total minus the leads the campaign already holds, and never more than the day's cap.
- Test: 1,000 a day on email
- Scale: 500 a day on email
- Run: 500 a day on email
- 150 a day on LinkedIn, in every stage

A view is dry when the last run left nothing in it.

## Segments

- a segment is a view on People, named for who is in it, never for a campaign
- its only fixed clauses are relevance = 1 and Status = done
- every other clause, including whether people already contacted are in or out, is segmentation
- two campaigns in play never share a view

## Secure email gateways

People behind a secure email gateway are never mixed into a normal send. One of two ways, chosen per campaign:

- **Two campaigns.** A gateway segment view feeds its own campaign. The main campaign runs on a view without them and with the sender set to skip gateway-protected domains
- **One campaign.** The sender is set to skip gateway-protected domains, and they are not reached

## What every campaign carries, on any sender

**Name**
- `YYYY-MM-DD - Market or Niche - Segment - playbook`

**Sequence**
- the touches, waits and variants exactly as approved
- follow-ups threaded under the first email, no new subject
- more than one variant on every step
- subject line, unsubscribe line and signature spun
- body spun every few words

**Sending**
- only from the client's inboxes, chosen by tag, read live
- Monday to Friday, 07:00 to 10:00 and 15:00 to 18:00 in the client's timezone, unless the client's overrides say otherwise
- limits live on the inbox, never on the campaign
- one lead per domain per day

**Replies**
- the sequence stops on a reply, at the domain, not the lead
- an unsubscribe goes to the workspace blocklist
- a bounce rate above 5% pauses the campaign

**Format**
- plain text, always
- no open tracking, no link tracking
- no links in the body
- exactly one blank line between every part of the email: each paragraph, the signature and the P.S. No empty spacer lines

**Variables**
- every token in the copy exists on the sender before the campaign is built
- every token arrives with the row from the view
- a row missing one is held back, never sent blank

**Draft first**
- built as a draft, flipped live by hand

## The record

- every campaign on a sender has exactly one row in the Hub, matched on the sender's campaign id
- the row carries the copy as approved, before spintax, the way the client would read it
- a campaign is built when it has been read back from the sender and matches what was approved. The sender says success while dropping settings