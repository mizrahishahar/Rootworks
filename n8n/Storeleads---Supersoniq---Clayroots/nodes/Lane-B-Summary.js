// Always emits exactly one marker item so the Join Lanes merge fires even on a zero-contacts run.
// Writes no Airtable rows. Connected after Format Supersoniq, so under executionOrder v1 (depth-first)
// the Read Final chain has already run when this fires, keeping Build Log's $('Read Final') counts accurate.
return [{ json: { _laneB: true } }];