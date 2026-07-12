Run the SOP: $sop_name.

$context

Load the SOP from `.claude/SOPs/`. Walk steps in order, honoring declared ownership.

- On a Claude run: execute through it, **invoking the named skill at each step that declares one.** Surface output at the run boundary.
- On an Operator step: stop, tell me what to do, wait for me to confirm done and return any context, then resume.
- For Agent SOPs: run front to back without pauses.
- For Solo SOPs: walk me through the steps and capture what I did. Do not execute.

**When a step declares an 'operator' role, you MUST stop**. you are waiting for my response.

**When a step declares a skill, you MUST invoke it via the Skill tool.** No paraphrasing.
