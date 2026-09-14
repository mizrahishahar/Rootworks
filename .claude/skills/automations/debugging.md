Teaches: how to read a run honestly, the ladder for chasing what went wrong, and when a finding becomes a GitHub issue.

# Debugging

## Reading a run row

Every machine writes its run by one contract, so a row reads the same everywhere:

- **One row per run, and the row is the lifecycle.** Running while in flight, then Succeeded, Succeeded with errors, or Failed. Failed is reserved for crashes, written by the shared error handler, so no run vanishes silently.
- **Errors counts errored records**; skips (nothing to do, out of scope, nothing on file) are a separate Skipped line in the Description, never counted as errors.
- **Batched machines accumulate in the row itself** (the Tally field); intermediate passes show Running with live progress; only the final pass writes the verdict.
- **Description is the narrative**, Execution Link is the door into the live execution, Duration and Records In and Out frame the size.
- The Client link is attached only when a run serves exactly one client.

A run row that contradicts the target table is wrong, not the table.

## The ladder

In this order, no rungs skipped:

1. **The run row.** Status, Errors, the Description's own account, Tally, the Skipped line.
2. **Cell values on the target table.** What actually landed, on real rows.
3. **The machine's source.** Read the node that produced the wrong value; the code nodes are real files. Most wrong diagnoses came from reasoning about behavior instead of reading the node.
4. **The live execution, reads only.** When the row and the code cannot explain it, the execution can: the real items, the real response bodies. **Read the provider's actual response before explaining what it means**; every wrong diagnosis on record came from inferring, every right one from reading the body.

## Traps, paid for

- **HTTP 200 from a door proves nothing**; a door answers on receipt. Verify by execution status and cell values.
- **A provider being down is a fact about the provider, never about the row.** Outage-stamped rows are wrong verdicts, not real negatives.
- **Big workflows overflow a single read.** A failed execution's queued-node stack carries full node source; the exported workflow is pretty-printed and grep-able.
- **Static data written inside a sub-execution is not persisted**; accumulators live in the run row.

## When it becomes an issue

A **defect**, the machine doing something its code should not, gets a GitHub issue on the repo: expected, observed, the execution link, the run row. Only real bugs; a lesson about a system is not a defect, it goes into the skill that owns that craft. Then work around or stop. Never fix inline.
