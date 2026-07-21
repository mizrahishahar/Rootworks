#!/usr/bin/env node
// PreToolUse guard for Bash. Redirects the two recurring anti-patterns to the
// sanctioned path (obsidian CLI / Write tool) BEFORE the command runs.
// Deny is deterministic and survives stale sessions / skimmed skills.
let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = (JSON.parse(data).tool_input || {}).command || ""; } catch (e) { process.exit(0); }

  const deny = (reason) => {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }));
    process.exit(0);
  };

  // 1. Never re-read your own tool-result cache off disk.
  if (/tool-results\//.test(cmd)) {
    deny("That is your own tool-result cache — the output is already in your context. Never re-read or re-parse it off disk (no cat/cp/jq/python over it). If you need a count or an aggregate over records, ask the tool for it: a filter, a search, or a view.");
  }

  // 2. Never push a multi-line note through obsidian content= (trips path
  //    validation, prompts every time). Content is written with obsidian eval (stage the body in a scratch file, then fs.readFileSync it and call app.vault.adapter.write).
  if (/\bobsidian\b[\s\S]*\bcreate\b[\s\S]*\bcontent=/.test(cmd) && /\n/.test(cmd)) {
    deny("Vault note content is written with obsidian eval (stage the body in a scratch file, then fs.readFileSync it and call app.vault.adapter.write), never `obsidian create … content=`. A newline followed by # trips path validation and prompts every time. content= is only for a single-line value.");
  }

  process.exit(0);
});
