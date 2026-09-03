// Ark Window Check: the AI-Ark lane's rate governor. Was a one-way circuit breaker (2026-09-02);
// backs off and resumes since 2026-09-03.
//
// AI-Ark's ceiling (five requests a second, 300 a minute) is global to the key, not to an
// execution, so a lane that paces itself correctly is still wrong the moment a second lane runs:
// four Insert machines call Waterfall Contacts without waiting, and it fires its ark pass without
// waiting. Execution 7954 burned about 1,679 calls on rate limits that way, and the breaker's
// answer was to abandon every company it had not reached. Abandoning was the wrong answer: a 429
// costs no credits, so the only real loss was the companies never served.
//
// Now: a window whose answers came back rate limited eight or more times is a storm. A storm makes
// the lane SLEEP (Backoff? -> Ark Backoff, sixty seconds, in-memory because it is under n8n's
// 65 s persistence line) and then take the next window. Only a storm with eight sleeps already
// spent gives up, and Ark Track still records every company never submitted as unserved, so the
// run row reports them either way. The static pace is 600 ms (Ark Export): two concurrent lanes at
// 600 ms sit under five a second, three sit exactly on it, and these sleeps carry the rest.
//
// Everything is counted from Ark Export's own runs, one run per window, and nothing reads a node
// downstream of this one: a storm in an earlier window IS a sleep already spent, because the only
// other thing a storm can do is stop the loop.
const STORM = 8;          // rate-limited answers in one window that make it a storm
const MAX_BACKOFFS = 8;   // storms slept through before the lane gives up
const runs = (name) => { const out = []; for (let i = 0; i < 10000; i++) { let it = null; try { it = $(name).all(0, i); } catch (e) { break; } if (!it || !it.length) break; out.push(it); } return out; };
const windows = runs('Ark Export');
const limitedIn = (run) => { let n = 0; for (const it of (run || [])) { if (Number((it.json || {}).statusCode) === 429) n++; } return n; };
let submitted = 0, rateLimited = 0, streak = 0;
for (const run of windows) {
  for (const it of run) {
    const j = it.json || {};
    submitted++;
    if (Number(j.statusCode) === 429) { rateLimited++; streak++; } else streak = 0;
  }
}
// This window only. The trailing streak never resets across windows, so a governor reading it
// could never see a lane recover; that is what made the old breaker one-way.
const windowLimited = limitedIn(windows[windows.length - 1]);
let backoffs = 0;
for (let i = 0; i < windows.length - 1; i++) { if (limitedIn(windows[i]) >= STORM) backoffs++; }
const storm = windowLimited >= STORM;
const backoff = storm && backoffs < MAX_BACKOFFS;
const stop = storm && backoffs >= MAX_BACKOFFS;
return [{ json: {
  stop: stop,
  backoff: backoff,
  waitSeconds: backoff ? 60 : 0,
  backoffs: backoffs,
  stormsTotal: backoffs + (storm ? 1 : 0),
  windowLimited: windowLimited,
  windows: windows.length,
  streak: streak,
  rateLimited: rateLimited,
  submitted: submitted
} }];
