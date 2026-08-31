# Intent signals

The intent standard, rebuilt 2026-08-31. One law: **the intent table is a standard ClayRoots
table**. Signals land rows; relevance and views cut and segment; the deploy doors feed
campaigns. Nothing about who gets messaged lives in code or in signal config.

## The pieces

| Piece | Where | Holds |
|---|---|---|
| **Signals** table | Hub `tblDtJeqkUB2JFga1` | one row per signal: Name, Client (link), Signal Type (select), Target Table, Roles, Country, Max Employees, ICP |
| **Signal handler** | one workflow per Signal Type (`hiring` = Handle Hiring Intent Signal, `9iMXBGRlPk3O6pDZ`) | trigger + signal-specific filtering; everything downstream is signal-agnostic |
| **The intent table** | client ClayRoots base | table standard, intent chain (Operator ruling 2026-08-31): `Grid view`, `Relevant`, `Cut review`, **`Relevant : Campaigns`** (the client window; NOT gated on Found, intent is dual-channel and LinkedIn leads never waterfall), then the campaign/deploy views. No waterfall-spine views in the intent chain. Plus `relevance` + `manually_approved`, share link in the description, `Campaigns` links, `Deploy Error` |
| **Feeds** | `Signal` (link) + `Signal View` on Hub Campaigns | the link IS the switch: linked = the campaign drinks daily from that view; remove the link = drip stops. Empty Signal View with a link = refused loudly |
| **Deploy doors** | `Deploy View to Campaign` (PlusVibe), `Deploy View to Alta Campaign` (`VIojA84aR72tg7k7`) | one launch = one view into one campaign; on-demand by launch row + webhook, daily by each door's feed trigger walking its Signal-linked campaigns |
| **Membership** | `Campaigns` links on rows, stamped at verified landing | THE dedupe. PlusVibe: stamp-gate on top of sequencer dedupe. Alta: the stamp is the only dedupe |

## Signals row semantics

- **Roles** — which scraped events count as the trigger (hiring: job titles). Signal-specific.
- **Country / Max Employees** — free hard lines on data the scrape already carries; the wallet's bouncer, not qualification.
- **ICP** — the sentence DiscoLike `validate/icp` judges each surviving company's website against. Targeting ("does this signal here mean what we think"), deliberately narrower than the client's Qualification Prompt ("can we sell to them at all"). Never couple them.

## Contact pull doctrine (constants in the handler, never per-signal config)

Mirrors SQ Contacts Batch: pull WIDE, cut in the base. ContaGen: seniority net only, no
department filter, 12 per company. AI-Ark: fixed wide title vocabulary (WORD mode), size 12,
0.5 cr per returned profile. **No people gate**: everything returned lands; a dropped person is
a visible `Cut review` row, never a silent code decision.

## The Alta door specifics

Alta answers 200 to pull-ins it later drops, so landing is decided by readback, never by the
push response. After landing, the door checks **Alta's own enriched title and URL** against the
buyer rule (mirror of `relevance`) and auto-pauses mismatches before a message can go out.
The campaign's **Pull-in URL** (audience webhook) is operator-pasted on the Hub Campaigns row;
no API exposes it; the door refuses to run without it.

## Adding a signal type

Build its handler (trigger + event filter, quarantined; qualify/collect/land sections copied
unchanged), add the Signal Type select option, document its Roles-equivalent parameter here.
Adding an intent TABLE on an existing type: Signals row + table to the setup standard + views
+ Signal links on the campaigns. Zero code.

## Dedupe, all layers (holes audited and closed 2026-08-31)

1. **Same row, same campaign, across runs**: the Campaigns stamp-gate in both doors.
2. **Crash between push and stamp (Alta)**: healed; when pushed rows outnumber fresh prospects, the readback resolves older members too and stamps a matching row instead of re-pushing it forever.
3. **Same URL twice inside one view**: in-run duplicate-URL guard in the Alta door (PlusVibe dedupes by email upstream).
4. **Workspace-wide (PlusVibe)**: Strict dedupe flags on every send.
5. **Cross-campaign (Alta)**: deliberate non-block (multi-campaign is allowed); mutual exclusion is the cascade views' job at design time.

## Known legacy (as of 2026-08-31)

- The Apify webhook still posts the retired KB play id; the handler resolves it via the
  single-hiring-signal fallback and flags every run log. Update the webhook payload to
  `rec3yoKbpzzG5Zmsp` and the flag goes away. Ambiguity (a second hiring signal) will refuse.
- Retired on the intent table, delete after a soak week: `LinkedIn Campaign`, `Email Campaign`,
  `LinkedIn Routed At`, `Email Routed At`, `Target Campaign`, `routed_at`, `Enroll Confirmed`,
  `Enroll Error`, `Event Type`, `Campaigns (old text)`.
- Retired machines, delete after a soak week: `Add Intent Leads to Alta`, `Add Intent Leads to
  PlusVibe` (both deactivated 2026-08-31; replaced by the doors' feed triggers).
