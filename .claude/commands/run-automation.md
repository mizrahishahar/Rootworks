# run-automation

Launch one of the machines and prove what it did.

We consume the machines here; we never edit them. `n8n/INDEX.md` is the catalogue: what each one does and when to use it. `n8n/<machine>/` holds its actual source if you need to know exactly what it will do to a table.

## Launch

Most machines start from a **launch row in the Hub Automations table** (`tbli7rV6Qf3sLpV6R`), created by their form; `CONTROL PANEL` holds one form link per machine. Some are fired by webhook instead. The launch row carries the parameters: base, table, view, key column, dedupe mode, tag, caps.

- **Say what you are about to run, on what target, with which parameters**, before firing. Name the table and view back.
- Fill only the parameters that machine reads. Read its source rather than guessing which fields matter.
- **Never spend without approval.** Any run that calls a paid provider (finders, verifiers, contact pulls) is quoted and approved first.

## Watch

The run row moves Running, then Succeeded or Failed, and carries counts in and out, duration, and a per-run Description. Read the row, not the n8n canvas.

## Done when

**Verified by cell values on the target table, never by the run log.** A run log has undercounted a good run by half and has reported Succeeded on a run that wrote nothing useful. State the before and after counts, and what changed on a sample row.

If a machine misbehaves: file a GitHub issue with the execution link and what you saw. Do not open the workflow.
