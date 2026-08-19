Teaches: how to read a run honestly, the ladder for chasing what went wrong, and when a finding becomes a GitHub issue.

# Debugging

## Reading a run row

The logging standard every machine meets, so a row reads the same everywhere:

- **One row per run, and the row is the lifecycle.** Running while in flight, then Succeeded, Succeeded with errors, or Failed. Failed is reserved for crashes; a crash still writes a row through the shared error handler, so no run vanishes silently.
- **Errors counts errored records**; skips (nothing to do, no email on file, out of scope) are a separate Skipped line in the Description, never counted as errors.
- **Batched machines accumulate in the row itself** (the Tally field), and intermediate passes show Running with live progress; only the final pass writes the verdict.
- **Description is the narrative**, Execution Link is the door into the live execution, Duration and Records In/Out frame the size.
- The Client link is attached only when a run serves exactly one client.

A run row that contradicts the target table is wrong, not the table. The log has undercounted a good run by half; the table is the proof, always.

## The ladder

Chase a problem in this order, and do not skip rungs:

1. **The run row.** Status, Errors, the Description's own account, Tally, the Skipped line.
2. **Cell values on the target table.** What actually landed, on real rows, before and after.
3. **The machine's source in `n8n/`.** Read the actual node that produced the wrong value; the code nodes are real `.js` files. Most wrong diagnoses in this system's history came from reasoning about behavior instead of reading the node.
4. **The live execution, through the n8n MCP, reads only.** When the row and the code cannot explain it, the execution log can: the real items, the real response bodies. **Read the provider's actual response before explaining what it means**; every wrong diagnosis on record came from inferring, every right one from reading the body.

## Traps, paid for

- **HTTP 200 from a form endpoint proves nothing**; n8n form triggers answer 200 before validating. Verify by execution status and cell values.
- **A provider being down is a fact about the provider, never about the row.** Outage-stamped rows are wrong verdicts, not real negatives.
- **Big workflows overflow the MCP's workflow read.** Two ways in that work: a failed execution's queued-node stack carries full node source, and operator-exported workflow JSON is pretty-printed and grep-able.
- **Static data written inside a sub-execution is not persisted**; that is why accumulators live in the Hub row.

## When it becomes an issue

A **defect**, the machine doing something its code should not, gets a GitHub issue on the repo (`gh issue create`): what was expected, what was observed, the execution link, the run row. Only real bugs; a lesson learned about a system is not a defect, it goes into the owning skill's files. Then work around or stop. Never fix inline; the fix arrives as a push to this repo.
