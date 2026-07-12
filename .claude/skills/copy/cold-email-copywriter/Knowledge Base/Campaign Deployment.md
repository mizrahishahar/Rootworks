# Campaign Deployment

Reference for taking an approved sequence live in PlusVibe and mirroring it into the client's shared vault. The when and the ownership live in the Create an Email Campaign SOP; this file is the how. Verify the live values against the current workspace at run time; the settings below are a starting point, not live state.

---

## PlusVibe: build a campaign (clone-based)

PlusVibe has no true "duplicate." You clone the settings from an existing campaign into a new one.

**Flow:** read a source campaign's config with `list_campaigns(campaign_id=...)` (returns `id`, `email_accounts`, `schedule`, `sequences`, toggles) -> `create_campaign` (makes a DRAFT) -> `patch_campaign_update` (sequences + accounts) -> `set_campaign_schedule` -> `add_leads_to_campaign`.

### Gotchas (get these right up front)
- `create_campaign` makes a DRAFT: daily_limit defaults to 100, no inboxes, no schedule. You fill the rest in the next calls.
- `patch_campaign_update` requires `first_wait_time` whenever you send `sequences` OR `email_accounts` (use `first_wait_time: 0` for a normal parent campaign). Without it: 400 "first_wait_time is required".
- Sequence `wait_time` is in DAYS, not minutes, despite the tool doc. Clone the source's exact values (e.g. 2 / 4 / 3 = Day 1 -> Day 3 -> Day 7).
- Email body must be HTML: `<div>...<br><br>...</div>`.
- `set_campaign_schedule` day keys are 1-7 (Mon=1); include ONLY the active days as `true` (Mon-Fri = `{"1":true,"2":true,"3":true,"4":true,"5":true}`). Sending `0` or a `false` day errors. `timezone` e.g. `America/New_York`, `timing:{"from":"07:00","to":"14:00"}`. `daily_limit` lives on this call, not on patch.
- Custom variables store with a `custom_` prefix: upload `custom_variables:{site_detail:"..."}` and the template must reference `{{custom_site_detail}}`, not `{{site_detail}}`, or it renders blank. Verify with `find_lead_by_email` (`lead_data`) and a UI preview before launch.
- `add_leads_to_campaign`: standard fields (email, first_name, last_name, company_name, city, phone_number) + a `custom_variables` object for the rest. Use `skip_if_in_workspace:true` to avoid re-mailing anyone already in another campaign (prevents same-inbox double-touch across segments). `is_overwrite:true` has NO skip guard: it re-adds leads that `skip_if_in_workspace` correctly excluded (caused a re-contact incident). On a backfill call `leads_uploaded > 0` is a red flag; it should be ~0. To backfill a field onto existing leads, prefer `update_lead_variables` (updates existing only, never adds). Audit the batch's emails + domains against the older campaigns before and after load.
- Verify the source's live settings (inbox count, schedule, waits, toggles) at run time; do not trust stale values.

### Variables (our placeholder -> PlusVibe)
- `{{first_name}}`, `{{company_name}}`, `{{city}}` are native and pass through.
- Any research placeholder (e.g. `{{site_detail}}`) uploads via `custom_variables` and is referenced as `{{custom_...}}` in the template.
- Map every placeholder in the copy to a real, populated field before launch. An unmapped or empty variable renders blank.

### Spintax
- Syntax: `{{random|option a|option b}}`.
- Purpose: vary the surface wording to protect deliverability WITHOUT changing the essence of the approved copy. Spin function words and light phrasings (the greeting, a connector, a neutral synonym). Never spin the offer, the proof number, the CTA, or the hook that got approved.
- Keep every spin natural and human. A spin that reads as filler or shifts the meaning is worse than no spin.

### Signature
- Token: `{{sender_signature}}` renders the SENDING inbox's `signature` field; it renders BLANK if that field is empty.
- Standard placement: the end of each email body, after the sign-off.
- If inbox signatures are not set and you want one shared block, hardcode the signature block into each body instead of the token. Decide once per build.

### Campaign naming convention
`{D.M.YY} - {descriptive campaign name}` - the build date plus the full segment descriptor, never the bare subfolder number. It matches the campaign folder name carried with its date. Example: `7.7.26 - Home Movers - Owner-Operators - Direct Contact`.

---

## Vault mirror (client-facing)

Once the campaigns are live, mirror the approved artifacts into the client's shared vault so they can see them in their own Obsidian. Always the clean vault version, never the PlusVibe-rendered copy.

- **Lead lists:** duplicate each campaign's CSV into `Prospects/{client}/Shared/Lead Lists/`, under the naming convention. CSVs stay CSVs.
- **Sequences:** export each clean sequence (no spintax, no signature) to `Prospects/{client}/Shared/Email Sequences/` as docx via Pandoc:
  `pandoc "Cold Email Sequence.md" -o "{D.M.YY} - {descriptive name}.docx"`
- Same naming convention on both sides.