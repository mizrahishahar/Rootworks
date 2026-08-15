#!/usr/bin/env node
// PreToolUse guard for Bash. Denies the one anti-pattern that reliably wrecks a
// session: re-reading your own tool-result cache off disk. Deterministic, so it
// survives a stale session or a skimmed instruction.
let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = (JSON.parse(data).tool_input || {}).command || ""; } catch (e) { process.exit(0); }

  if (/tool-results\//.test(cmd)) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "That is your own tool-result cache - the output is already in your context. Never re-read or re-parse it off disk. If you need a count or an aggregate, ask the tool for it: a filter, a search, or a view.",
      },
    }));
    process.exit(0);
  }

  process.exit(0);
});
