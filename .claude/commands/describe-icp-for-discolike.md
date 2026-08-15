# describe-icp-for-discolike

Write the detailed **ICP description** for a [[DiscoLike]] pull — the prose that goes in `icp_text` — plus the structured filters that ride with it. One artifact: a description the Operator pastes straight in.

Loads `list-builder`. Company data always comes from DiscoLike; contacts never do.

## The description is the instrument, not the decoration

`discover-similar-companies` runs a **semantic vector search over crawled website content**. The structured filters only fence the pool; inside that fence, the prose decides what comes back and in what order. A sharp description against loose filters beats tight filters against a vague one.

So write it against **what a crawler can see on the site**, not against abstract business qualities. "Companies with strong engineering culture" matches nothing. "A pricing page with usage-based tiers, developer documentation, a status page, and job listings for platform engineers" matches something.

{extra context}
