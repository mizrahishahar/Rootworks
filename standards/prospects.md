# Prospects

A prospect is one company, at one client, that replied positively or booked a meeting. One row per company per client; a second person from the same company joins the row.

It is worked from its row. Status says where it is, the thread says what was said, the clock says what is due. The goal of every prospect is a meeting held on the client's calendar. What happens on the call, and after it, is the client's.

## Statuses

Every prospect is in exactly one Status.

**Positive Reply**
- in play: a reply is being worked toward a call

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
- the chase ran out. Never chased by hand again

Intake sets Positive Reply or Disqualified. A booking sets Scheduled Call. A held meeting sets Call Completed. The clock sets Lost, No Show, and Holding back to Positive Reply. A reply from a Lost or Disqualified prospect puts him back in Positive Reply. Every other move is a decision, the Operator's or the client's.

## The ball

- his message after ours: the ball is ours, a reply is due
- our message after his: the ball is his, the clock runs from our last message
- a record comment from the Operator or the client's BDR overrides the clock. "Asked us to come back in October" is Holding with the date, whatever the thread says

## The clock

Counted in business days, in the prospect's timezone.

**The first reply**
- out the same business day the reply landed
- both ways to book, always: two real times and the scheduling link

**The chase**, from our last unanswered message:
- day 1: the lost-times move
- day 2: the value move
- day 4: the lost-times move, and the phone nudge to the client's BDR
- day 10, still nothing: Lost

The two moves alternate and the same move never runs twice in a row. Lost-times: the times offered are gone, two new ones and the link. Value: one true thing about his business and why the call pays, then the ask. What the words are is the craft's; that these are the only two moves, and when they run, is decided here.

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

- the moment a prospect qualifies, the client's BDR gets the card with the phone in the client's channel
- the thread and the phone run in parallel; neither waits for the other
- the BDR's notes in the card's thread land on the row as comments, and the clock reads them

## Who writes

- the machine decides the move and the day; the agent writes the words; a person approves
- the first reply and every answer to a question are always drafts, approved before they go
- the lost-times move, the day-before note and the no-show note are sent by the agent without approval only for a client the Operator switched on. Until then they are drafts too
- every draft lands in two places: the sender's thread, ready to send, and the BDR thread on Slack
- a time in a message is a real open slot read from the client's scheduler, in his timezone. Never invented, never a call length that is not known

## Re-approach

- a Lost or Disqualified prospect is never chased by hand again
- whether a campaign reaches his company again is segmentation, decided on the list
- a not-interested reply is a DNC, and that is the campaigns standard's

## The numbers

Per client, trailing 30 days:
- **positive to booked:** prospects that reached Scheduled Call, No Show or Call Completed, over positives
- **booked to held:** Call Completed over booked
- **hours to first reply:** from the reply landing to our first message. The standard is the same business day

## The board

Every client, every day:
- **NEW:** the ball is ours and no first reply went out
- **DUE:** a move is due today, which one
- **WAITING:** the ball is his, nothing due
- **BOOKED:** upcoming calls, and whether the day-before note went
- **NO SHOW:** with the day of the miss
- **HOLDING:** with the date
- **STALE:** rows the clock cannot judge: no last touch, no thread, a booked call with no meeting date. One line each until a person rules
- the three numbers

## The record

- one row per company per client, matched on client and domain
- the row carries the Status, the source, the campaign he answered, the thread as one piece, last engaged, last touch, Next Touch Date, the day the call was booked, the meeting, and the BDR thread
- the thread is refreshed from the sender every morning before the clock runs. On a morning a sender's threads did not arrive, none of its prospects are judged
- record comments are the human layer. They are read on every judgment and never overwritten
