# Prospects

Everything from a positive reply until a call is held on the client's calendar. What happens on the call, and after it, is the client's.

A prospect is one company, at one client. One row, one conversation, one clock. A second person from the same company joins the row, and the row follows whoever wrote last.

## Who becomes a prospect

- **Email:** only a positive reply. A not-interested reply is a DNC; a neutral one is nothing
- **LinkedIn:** every reply from a person. A yes is Positive Reply; anything else is Engaged
- **A booking:** always
- an automatic reply is not a person and is not an event

## Statuses

- **Engaged:** LinkedIn only. He answered without a yes
- **Positive Reply:** he said yes to something. In play toward a call
- **Holding:** he asked for later. Out of play until its date
- **Scheduled Call:** a meeting is on the client's calendar
- **No Show:** the slot passed and no meeting was held
- **Call Completed:** held. The domain ends here
- **Disqualified:** not a fit
- **Lost:** the follow-ups ran out

## Three roles

- **Handler:** reacts to an event. Puts the facts on the row within minutes and wakes the operator once
- **Manager:** runs once a day, after the senders' threads were synced. Reads every open row, sets the next touch time, moves the statuses below, reports what was owed and not sent
- **Operator,** a person or an agent: the only one who talks to a prospect

The manager never writes a word to a prospect and knows nothing about what a message says. The operator never decides when a touch is due.

## Events

| # | Event | On the row | Wakes the operator |
|---|---|---|---|
| 1 | First reply | the prospect created and qualified: status, thread, his last message, timezone | yes. Never for a Disqualified on email: that row is written and closed |
| 2 | Reply in a conversation | the thread, his last message. Next touch cleared, Follow-ups 0. A Lost prospect is back in the status he had | yes, once he has been quiet: 3 minutes on LinkedIn, at once on email |
| 3 | Meeting booked | Scheduled Call, the meeting and its time, Follow-ups 0, the booked touches | yes |
| 4 | Meeting changed | cancelled: Positive Reply, Follow-ups 0, next touch cleared. Moved: the booked touches move with it | yes |
| 5 | Touch due | Follow-ups plus one, when the touch is a follow-up | yes |

A held meeting is not an event: the recordings are the client's, not ours. A person sets Call Completed.

- a sender's or a scheduler's webhook fires the handler. Never a poll, never a sync
- facts first, the wake second
- the wake carries the prospect and the reason, nothing else
- one burst of messages is one event
- the same on every sender

## Who moves a status

- **a handler:** Engaged, Positive Reply or Disqualified at the first reply; Scheduled Call; back to Positive Reply on a cancellation; a Lost who writes again
- **the manager:** Lost, and Holding back into play on its date
- **a person or the operator:** Engaged to Positive Reply, Holding with its date, No Show, Call Completed, Disqualified from the thread, anything else

## The row

What the system runs on: Status, his last message, our last message, Next Touch Time, Follow-ups, Timezone.

**Timezone**
- the zone's name, such as America/Los_Angeles. Never an abbreviation
- written by the handler that creates the prospect, from the person's location, else the company's headquarters
- never blank. Nothing known: America/New_York
- a person's correction is never overwritten

## Responses and follow-ups

- **a response** answers his message. As fast as possible, any hour, any day. Never part of the cadence
- **a follow-up** is sent while his silence continues. Only follow-ups have a cadence
- a follow-up is scheduled only when our message is the latest. When his is the latest, a response is owed and there is no next touch time
- a Disqualified prospect gets no follow-ups

## The cadence

Counted from our response. Each follow-up is set from the one before it.

| | 1 | 2 | 3 | 4 | 5 | Lost |
|---|---|---|---|---|---|---|
| **Email,** his business days | 1 | 2 | 3 | 4 | 9 | 15 |
| **LinkedIn,** calendar days | 1 | 2 | 4 | 9 | 21 | 30 |

- LinkedIn is the same for Engaged and Positive Reply
- no follow-up is sent on his weekend, on either channel. It moves to his next working day
- **Follow-ups** counts the follow-ups that came due since our last response. He writes, he books, a meeting is cancelled, a No Show is set, a Holding date arrives: 0
- at 5 with the last wait passed: Lost

## The hour

His local time. Never a round minute.

| Follow-up | Time |
|---|---|
| 1 | the time he answered us, plus or minus 25 minutes. Outside 08:00 to 18:00: Morning |
| 2 | one hour before that, plus or minus 25 minutes |
| 3, 4 | Morning, 08:30 to 10:30, and Midday, 12:30 to 14:00, one each in random order, a random minute |
| 5 | 07:30 to 08:30 |

**The operator's hours.** Until a client's sending is automatic, a follow-up or a booked touch must also fall between 08:00 and 23:00 in Israel, on a day the operator works. One that does not moves to the nearest of his slots that does. Responses are not moved.

## Booked

| Touch | When | Condition |
|---|---|---|
| Confirmation | at the booking | always. It is a response |
| Warm | 3 days before the call | booked 5 or more days ahead |
| Day before | 24 hours before | booked 36 or more hours ahead |
| Same day | 2 hours before, never before 07:30 his time | always |

These use Next Touch Time and never Follow-ups. After the last one Next Touch Time stays empty; Scheduled Call is the only status where that is correct.

## The other cases

- **Holding:** its date is the next touch time. When it arrives he is back in the status he had, Positive Reply if he was ever positive, else Engaged. The message sent then is a response, and the cadence runs from it
- **Meeting cancelled:** the message sent is a response, and the cadence runs from it
- **No Show:** set by a person. The operator is woken for the no-show response, the cadence runs from it, and the status stays No Show until he books again or is Lost
- **Two channels:** an email prospect who connected on LinkedIn stays on the email cadence. Each follow-up goes by email and is mirrored on LinkedIn. A reply on either channel is a reply, answered where he wrote

## The call nudge

A fixed line from the machine to the client's BDR. Only when a phone is on the row and the client has a BDR channel. The phone is looked for once, at the first positive reply. We remind; we never schedule the BDR's calls.

| Point | Email | LinkedIn |
|---|---|---|
| First positive reply | the call card with the phone, beside the lead card the client always gets | none |
| Follow-up 3 comes due | the nudge | the nudge, Positive Reply only |
| Meeting cancelled | the nudge | the nudge |

## The LinkedIn connection

For a client who has it switched on, at a positive reply on email, when his LinkedIn URL is on the row:
- the person who emailed him is one of the client's LinkedIn seats: that seat sends a request with no note
- he is not: a seat sends the request with the client's approved connection note. No note on file, no request
- never in the same minute as our response

## What every message carries

- an ask on email carries two real times and the scheduling link, both, always
- a time is a real open slot on the client's scheduler, in his timezone. A call length is said only when it is known
- no two follow-ups in a row make the same move
- a follow-up never says it is one, and never names his silence
- every message leaves him something to answer, unless it closes the conversation, and then it is warm and short

**The first response on email.** Same thread, same sender, plain text. The same size whatever he asked: when the answer grows, the proof shrinks.

| # | Block | What it is |
|---|---|---|
| 1 | Opening | his name and the direct answer in the first words, on its own line |
| 2 | The answer | what he asked for, in full. He asked nothing: how it works, in short. He said yes to a call: skipped |
| 3 | Proof | the client's social proof, fitted to him, two or three lines. One line when he said yes to a call |
| 4 | The ask | two real times, and one line on who he meets and what he gets |
| 5 | The link | or pick any time here |
| 6 | Sign-off | first name |

**A response on LinkedIn.** Every reply gets one, Engaged, Positive Reply or Disqualified, written person to person. What it says is the setter's judgment.

**The other responses,** the same on both channels

| | Must carry | Never |
|---|---|---|
| A question or an objection | the answer to his exact sentence, then the ask if the answer leads there | a dodge |
| Meeting cancelled | the cancellation in one light line, two new times and the link. He gave a reason and a later time: Holding with the date, no times now | asking why, guilt, a pitch |
| No Show | the miss named once, two new times and the link | guilt |
| Back from Holding | what he asked us to wait for, one new thing since, the ask | pretending it is a first contact |

**The follow-ups**

| # | Email | LinkedIn |
|---|---|---|
| 1 | lost-times: the times we offered are gone, two new ones and the link | a light human line. It does not repeat the ask |
| 2 | value: one true thing about his business and why the call pays, then the ask | something from his world, then a question |
| 3 | lost-times again | the direct ask with proof: what we built, for whom, would he like to see it |
| 4 | proof: a result or an asset that fits him, then the ask | a real question about how he handles it today |
| 5 | the door out: the problem named plainly, and permission to say it can wait | a return tied to a real signal, the door open |

Mirrored on LinkedIn, an email follow-up is the same move in two lines.

**Booked**

| Touch | Must carry |
|---|---|
| Confirmation | the time in his timezone, who he meets, the invite is on its way and he accepts it. Never a request to confirm the time again |
| Warm | one useful thing tied to what the call will cover. No ask |
| Day before | the link, one line on what the call goes through |
| Same day | one line: the link and the hour |

## Owed and not sent

- a response is owed when his message is the latest. A touch was missed when its time passed and our last message is older than it
- anything owed and not sent is one line in the manager's daily message, with what it was and when it was due. A person handles it. The manager reports and never repairs
- a missed follow-up does not stop the cadence

## The numbers

Per client, over the last 30 days:
- **positive to booked:** of the prospects that turned Positive Reply, how many booked
- **booked to held:** of the calls booked, how many were held

An Engaged prospect is in neither until he turns Positive Reply.

