# Prospects

A prospect is one company, at one client, that answered us or booked. The goal is a meeting held on the client's calendar.

## Who becomes a prospect

- **Email:** only a positive reply. A not-interested reply is a DNC; a neutral one is nothing
- **LinkedIn:** every reply from a person. A yes is Positive Reply. Anything else, neutral, a question, not interested, is Engaged, and we answer it
- **A booking:** always

## Statuses

- **Engaged:** LinkedIn only. He answered without a yes. A conversation, not a lead
- **Positive Reply:** he said yes to something. In play toward a call
- **Holding:** he asked for later. Out of play until his Next Touch Date
- **Scheduled Call:** a meeting is on the client's calendar
- **No Show:** the slot passed and no meeting was held
- **Call Completed:** held. The client's from here
- **Disqualified:** not a fit
- **Lost:** the conversation ran out

**Next Touch Date** is the day a Holding prospect comes back into play. A person sets it together with Holding, from what he wrote: "after the holidays" is a date. No date named means 30 days.

## Who moves what

- **the handler:** Engaged, Positive Reply or Disqualified at the reply; Scheduled Call at the booking
- **the manager:** Lost, No Show, Call Completed from a recording, Holding back to Positive Reply, a Lost who writes again back in play
- **a person:** Engaged to Positive Reply, Holding with its date, every other move
- a comment on the row overrides the clock

## The clock

Business days, counted from his last message. Day 0 is the day he wrote.

| Day | Positive Reply | Engaged |
|---|---|---|
| 0 | our reply: his questions answered, two real times and the scheduling link, both, always | our reply, by what he wrote |
| 1 | lost-times | |
| 2 | value | |
| 4 | lost-times, and the phone nudge to the client's BDR | |
| 10 | Lost | Lost |

- **lost-times:** the times we offered are gone, two new ones and the link
- **value:** one true thing about his business and why the call pays
- he writes again at any point: day 0 again
- **Holding:** on Next Touch Date he is Positive Reply and it is day 2, a value move
- **Booked:** the day before the call, one note: the link and what the call covers
- **No show:** no meeting held two hours past the slot. The no-show note that day, then the table runs from day 1

## How it runs

- **a reply lands, any hour:** the handler writes the row and wakes the agent at once with the prospect and the move
- **every morning:** the manager reads every open row, counts the days, makes its moves, and wakes the agent once for every prospect with a move due that day, naming the move
- **the agent** writes the message into the sender's thread as a draft and posts it to Slack. A person sends it, inside his business hours
- a move counts as done when our message shows in the thread. Until then it is due again the next morning
- the lost-times move, the day-before note and the no-show note are sent by the agent itself only for a client the Operator switched on
- a time in a message is a real open slot from the client's scheduler

## The row

What the clock and the agent read: Status, Source, Client, the campaign he answered, the qualification and its brief, his timezone, the thread, his last message, our last message, Next Touch Date, the day the call was booked, the meeting and its date, the contacts with their phones, the card's Slack thread, the comments.

## The numbers

Two leaks, per client, over the last 30 days:
- **positive to booked:** of the prospects that turned Positive Reply, how many booked a call
- **booked to held:** of the calls booked, how many were held

An Engaged prospect is in neither until he turns Positive Reply.
