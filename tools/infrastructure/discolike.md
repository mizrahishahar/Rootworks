---
vertical: [list-building]
type: infrastructure
owner: Operator
---

# DiscoLike

Company discovery from an SSL-certificate web index, ~70M domains. Reaches the SMB, blue-collar, private, and non-English tail LinkedIn misses. Yields firmographics and public or role emails on company rows; named people come from bridging its domains into a contact source.

## Actions (MCP)
- `validate-icp-fit` - test an ICP description against a small sample to ~80% fit before anything scales.
- `run-discogen` / `get-discogen-status` - qualify a domain set; async, poll to done.
- `extract-website-text`, `segment-domains`, `save-mcp-query` (only a saved query is referenceable downstream).

## Spend gate
Discovery bills on the platform, net-new only, 90-day cache (re-pulls free). The sample validation is the cheap gate: do not scale a pull that fails it.