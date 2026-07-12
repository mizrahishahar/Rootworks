---
vertical: list-building
type: company-source
owner: Operator
handler: companies ingest, contacts ingest (see clayroots tool)
---

# DiscoLike

## Description
Company discovery from an SSL-certificate web index, ~70M domains. Reaches the SMB, blue-collar, private, and non-English long tail LinkedIn misses. Yields public and role emails on company rows; named people come only from bridging its domains into a contact database.

## Query
An ICP description (one paragraph, written the way the target's homepage reads, one audience) plus representative seeds and filters. Two audiences means two queries.
- `category` is the precision anchor (uppercase enum, top two per company); anchor every spec on it and add adjacent groups.
- `phrase_match` / `negate_phrase_match` are risky and never add recall; keep near zero.
- Firmographics live in filters, not the description text. Exclude by omission, not negation.

## Claude actions (MCP)
Research and validation only, never the discovery pull:
- `validate-icp-fit` — test a description against a sample.
- `run-discogen` / `get-discogen-status` — qualify a domain set; async, poll to done.
- `extract-website-text`, `segment-domains`.
- `save-mcp-query` — only a saved query is referenceable downstream as an inclusion or exclusion source.

## Owner actions
Run the discovery and the DiscoGen validation pass on the platform; hand back the qualified domain CSV; upload it to the handler.

## Quality
Validate a sample (5 to 100 accounts) with `validate-icp-fit` to ~80% before the full pull. Re-validate across the full pull and cut the weak tail; the last ~25% of an AI-ranked list drifts. A human reviews the flagged, since some borderline fits are real targets.

## To know
Seeds are the search vector: a few off-ICP seeds bias the whole ranked pull, so replace the auto-suggested seeds with representative ones. Net-new only, 90-day cache (re-pulls free). Rows carry homepage text, firmographics, the DiscoGen variables, and `public_emails`.

## Automations
`SEGMENT DISCOLIKE COMPANIES` lands the domain and public-email splits; `SEGMENT DISCOLIKE CONTACTS` lands the named-contact export.
