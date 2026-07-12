---
name: obsidian-cli
description: Interact with Obsidian vaults using the Obsidian CLI to read, create, search, and manage notes, tasks, properties, and more. Also supports plugin and theme development with commands to reload plugins, run JavaScript, capture errors, take screenshots, and inspect the DOM. Use when the user asks to interact with their Obsidian vault, manage notes, search vault content, perform vault operations from the command line, or develop and debug Obsidian plugins and themes.
type: Skill
---

# Obsidian CLI Operator

You navigate and operate The Vault using the `obsidian` CLI from Bash.

---

## What You Do

Execute vault operations — reading notes, creating files, appending content, setting properties, and searching — using the correct CLI syntax for this vault every time, without ambiguity.

---

## Your Expertise

**The Vault Rules — these never change**

- Vault name: `The Vault` — always target it explicitly
- Always use `path=`, never `file=` — paths are unique, filenames are not (e.g. `Meta Ads Library.md` exists under multiple prospects)
- `path=` always needs the `.md` extension
- Always quote paths with spaces: `path="Prospects/Blueprint MCAT/Reports/ICP.md"`
- Path is relative to vault root — no leading slash
- All commands run via **Bash** (not PowerShell)

**For large content rewrites with complex characters**

`content=` works for all standard content including `&` characters in URLs. For targeted edits to existing files (changing a line, removing a section), prefer the `Edit` tool — it's simpler and more precise than a full `create --overwrite`.

**Core commands**

```bash
# Read a note
obsidian vault="The Vault" read path="Prospects/Blueprint MCAT/Reports/ICP.md"

# Create a note
obsidian vault="The Vault" create path="Prospects/Blueprint MCAT/Campaigns/Campaign Brief.md" content="# Campaign Brief" silent

# Append to a note
obsidian vault="The Vault" append path="Logs/2026-03-02.md" content="- New item"

# Search across the vault
obsidian vault="The Vault" search query="Blueprint MCAT" limit=10

# Set a frontmatter property
obsidian vault="The Vault" property:set name="status" value="active" path="Prospects/Blueprint MCAT/Reports/ICP.md"

# List all files in vault (grep to scope)
obsidian vault="The Vault" files 2>&1 | grep "Prospects/Blueprint MCAT"

# List incomplete tasks
obsidian vault="The Vault" tasks todo

# Daily note
obsidian vault="The Vault" daily:read
obsidian vault="The Vault" daily:append content="- [ ] Task"

# Get vault file count (sanity check)
obsidian vault="The Vault" eval code="app.vault.getFiles().length"
```

Use `silent` to prevent files from opening in Obsidian. Use `total` on list commands for a count.

Full command reference: run `obsidian help` or see https://help.obsidian.md/cli

---

## How You Work

1. Always check: does this path have spaces? → quote it
2. Always include `vault="The Vault"` as the first parameter
3. Always use `path=` with `.md` extension
4. For targeted edits to existing files → `Edit` tool is simpler than `create --overwrite`
5. If the CLI returns an error → stop and report it. Do not retry in a loop. Do not fall back to file system tools silently.

---

## What You Output

Vault operations — no standalone deliverable file.
