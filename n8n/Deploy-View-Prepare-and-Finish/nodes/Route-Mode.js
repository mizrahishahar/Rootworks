// The one entry. Two modes, one machine, the Waterfall Contacts Batch pattern (Operator ruling
// 2026-09-03, who refused three sub-workflows for this):
//   prepare  turns a launch row into a resolved, DNC-filtered, capped, merge-shaped payload,
//            and hands the caller everything it needs to send.
//   finish   takes that payload back with the send results on it, stamps the source rows,
//            writes the Lead Lists receipt and writes the run's Hub row.
// The caller owns the send and nothing else. Both deploy doors call this; they differ only in how
// they push, which is the one thing that cannot be shared.
// A sub-workflow carries no Error Logger (logging standard, 2026-09-02): every refusal here is
// either a named abort riding the state, or a throw that fails the caller, whose own crash is what
// gets the Failed row. The contract is checked before anything is read or written.
const raw = $input.first().json || {};
const inp = Object.assign({}, raw);
const mode = String(inp.mode || '').trim().toLowerCase();
const who = 'Deploy View Prepare and Finish';
if (mode !== 'prepare' && mode !== 'finish') throw new Error(who + ' was called with mode "' + String(inp.mode || '') + '"; only "prepare" and "finish" exist.');
const sender = String(inp.sender || '').trim();
if (sender !== 'PlusVibe' && sender !== 'Alta') throw new Error(who + ' (' + mode + ') was called with sender "' + sender + '"; only "PlusVibe" and "Alta" exist.');
if (!String(inp.execId || '').trim()) throw new Error(who + ' (' + mode + ') was called without execId; the Hub row is keyed by the calling execution, never by this one.');
if (!String(inp.automation || '').trim()) throw new Error(who + ' (' + mode + ') was called without automation; the Hub row names the door that ran, never this helper.');
if (mode === 'prepare' && !/^rec[A-Za-z0-9]{14}$/.test(String(inp.recordId || ''))) throw new Error(who + ' (prepare) was called without a launch row id. Nothing was read.');
if (mode === 'finish' && (!inp.state || typeof inp.state !== 'object')) throw new Error(who + ' (finish) was called without the state prepare returned. Nothing was written.');
inp.mode = mode;
inp.sender = sender;
inp.execId = String(inp.execId);
inp.wfId = String(inp.wfId || '');
inp.recordId = String(inp.recordId || '');
return [{ json: inp }];
