# Prospects

A prospect is one company, at one client, that answered us or booked a meeting. One row per company per client; a second person from the same company joins the row.

It is worked from its row. Status says where it is, the thread says what was said, the clock says what is due. The goal of every prospect is a meeting held on the client's calendar. What happens on the call, and after it, is the client's.

## Statuses

Every prospect is in exactly one Status.

**Engaged**
- a person answered and did not say yes: a pass, a reason, a question, a redirect
- a conversation, not a lead. No card to the client, never counted as a positive

**Positive Reply**
- in play: he said yes to something, and the reply is being worked toward a call

**Holding**
- he named a later time. Out of play until Next Touch Date

**Scheduled Call**
- a meeting is on the client's calendar

**No Show**
- the slot passed and the meeting was not held

**Call Completed**
- the meeting was held. The prospect is the client's from here

**Disqualified**
- not a fit, judged at intake or from the thread

**Lost**
- the conversation ran out. Never chased by hand again

Intake sets Engaged, Positive Reply or Disqualified. A booking sets Scheduled Call. A held meeting sets Call Completed. The clock sets Lost, No Show, and Holding back to Positive Reply. A new reply from a Lost prospect puts him back where he was, Engaged or Positive Reply. Engaged becomes Positive Reply when he says yes, and a person makes that move. Every other move is a decision, the Operator's or the client's.

An automatic reply is not a person answering. It makes no row.

## The ball

- his message after ours: the ball is ours, a reply is due
- our message after his: the ball is his, the clock runs from our last message
- a record comment from the Operator or the client's BDR overrides the clock. "Asked us to come back in October" is Holding with the date, whatever the thread says

## The clock

Counted in business days, in the prospect's timezone.

**The first reply**
- out the same business day the reply landed, to every person who answered
- to a Positive Reply, both ways to book, always: two real times and the scheduling link
- to an Engaged, one message by the read of what he wrote. No call ask he did not open
- to a Disqualified, one message that closes warmly. Everyone who answers gets an answer

**The chase**, Positive Reply only, from our last unanswered message:
- day 1: the lost-times move
- day 2: the value move
- day 4: the lost-times move, and the phone nudge to the client's BDR
- day 10, still nothing: Lost

The two moves alternate and the same move never runs twice in a row. Lost-times: the times offered are gone, two new ones and the link. Value: one true thing about his business and why the call pays, then the ask. What the words are is the craft's; that these are the only two moves, and when they run, is decided here.

**Engaged**
- never chased. Our one message stands
- he answers: the ball is ours again
- day 10 with nothing from him: Lost

**Holding**
- Next Touch Date is set when he names the time
- on that day he is Positive Reply again, the ball is ours, and a value move is due

**Booked**
- the day before the call, one note from a person: the link and one line on what the call covers. The scheduler's own reminder is not that
- a cancellation or a reschedule on the scheduler moves the row the same day

**No show**
- the slot passed and no meeting was held within two hours: No Show
- the no-show note goes the same day: the miss named once, two new times, the link
- then the chase runs from that note, on the same clock

**Held**
- Call Completed when a recorded meeting with his domain lands, or the BDR says so in the thread

## The phone

- a phone is looked for on every person who answers. A company out of the client's ICP never gets the paid lookups
- the moment a Positive Reply qualifies, the client's BDR gets the card with the phone in the client's channel
- the thread and the phone run in parallel; neither waits for the other
- the BDR's notes in the card's thread land on the row as comments, and the clock reads them

## Who writes

- the machine decides the move and the day; the agent writes the words; a person approves
- the agent is told the move it was woken for. It never infers it from the wording of the wake
- the first reply and every answer to a question are always drafts, approved before they go
- the lost-times move, the day-before note and the no-show note are sent by the agent without approval only for a client the Operator switched on. Until then they are drafts too
- every draft lands in the sender's thread, ready to send. A prospect with a card gets it in the card's thread too; one without a card gets it in our own channel
- a time in a message is a real open slot read from the client's scheduler, in his timezone. Never invented, never a call length that is not known

## Re-approach

- a Lost or Disqualified prospect is never chased by hand again
- whether a campaign reaches his company again is segmentation, decided on the list
- a not-interested reply is a DNC on every sender, and that is the campaigns standard's

## The numbers

Per client, trailing 30 days:
- **positive to booked:** prospects that reached Scheduled Call, No Show or Call Completed, over positives. A positive is a prospect that was ever Positive Reply; Engaged never counts
- **booked to held:** Call Completed over booked
- **hours to first reply:** from the reply landing to our first message. The standard is the same business day

## The board

Every client, every day:
- **NEW:** the ball is ours and no first reply went out, Positive Reply first, then Engaged
- **DUE:** a move is due today, which one
- **WAITING:** the ball is his, nothing due
- **BOOKED:** upcoming calls, and whether the day-before note went
- **NO SHOW:** with the day of the miss
- **HOLDING:** with the date
- **STALE:** rows the clock cannot judge: no last touch, no thread, a booked call with no meeting date. One line each until a person rules
- the three numbers

## The record

- one row per company per client, matched on client and domain
- the row carries the Status, the source, the campaign he answered, the thread as one piece, last engaged, last touch, Next Touch Date, the day the call was booked, the meeting, and the card's thread when there is one
- the thread is refreshed from the sender every morning before the clock runs. On a morning a sender's threads did not arrive, none of its prospects are judged
- record comments are the human layer. They are read on every judgment and never overwritten
