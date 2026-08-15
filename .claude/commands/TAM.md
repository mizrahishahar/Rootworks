# TAM — Total Addressable Market Estimator

Estimate the total addressable market for a niche or sector, expressed as a company count and decision-maker headcount, to quickly assess whether the sector is large enough for a cold email test campaign.

## When to Use

- User provides a niche, sector, or industry and asks for a TAM estimate
- User types `/tam [sector]` or asks "how big is the market for X"
- User wants to know if a market is worth a cold email campaign before building a list

---

## Step 0 — Clarify Before Estimating

Before running numbers, confirm you have enough specificity. If any of the following are unclear, ask the user:

1. **Subsector:** Is this the full sector or a specific niche? (e.g., "healthcare" → healthcare IT? medical staffing? dental practices? urgent care?)
2. **Geography:** US only, North America, or global?
3. **Company size:** SMB (~$1M–$10M revenue), mid-market (~$10M–$100M), enterprise ($100M+), or all sizes?

If the niche is already specific enough to estimate (e.g., "HVAC contractors," "independent insurance agencies," "AWS consulting firms"), skip this step and proceed. Only pause if ambiguity would materially change the estimate.

---

## Step 1 — Find or Estimate Total Market Revenue

Search for published market size data first. Run these queries:

1. `"[sector] market size" United States 2024 OR 2025`
2. `"how many [sector] companies" United States OR US`
3. `"[sector] industry" NAICS companies revenue`

Prefer sources like IBISWorld, Statista, the US Census Bureau (County Business Patterns), the SBA, or industry association reports. If a direct company count exists, use it and skip the revenue-based calculation.

If no usable data is found, reason from a proxy:
- BLS occupational employment data (headcount → firm count via typical firm size)
- SBA small business profiles by NAICS code
- Comparable markets with known company counts

State which source or proxy you used and why.

---

## Step 2 — Estimate Average Revenue Per Company

Determine a reasonable average annual revenue per company for the **target segment**. Reason from:
- Typical contract or project size in the sector
- Employee-to-revenue ratios (professional services: ~$150K–$250K/employee; manufacturing: varies widely)
- Any pricing benchmarks found in the search

State the assumption clearly: e.g., *"Mid-market HVAC firms typically run $3M–$15M in revenue; using $7M as a midpoint."*

---

## Step 3 — Calculate Raw Company Count

If you found a direct company count in Step 1, use it. Otherwise:

```
Raw Company Count = Total US Market Revenue ÷ Average Revenue Per Company
```

Round to a directional figure. Show the math.

---

## Step 4 — Apply a Reachability Discount

Not every company in a sector is a viable cold email target. Apply a discount based on the following:

| Condition | Discount |
|-----------|----------|
| Well-defined niche, clear buyer title | 0–10% |
| Some companies are too small to have a dedicated budget holder | 15–25% |
| Many locations are franchise or chain-controlled (one DM covers many units) | 30–50% |
| Highly fragmented with many solo operators or owner-operators | 40–60% |

You may stack multiple conditions. State which apply and why, then apply the combined discount to the raw company count.

---

## Step 5 — Estimate Decision-Maker Headcount

```
Total Addressable Contacts = Reachable Companies × Decision Makers per Company
```

Use **2 decision makers per company** as the default. Adjust if:
- Enterprise target: 3–5 stakeholders per deal
- SMB / owner-operated: 1–2
- Single clear buyer title (e.g., always the CFO): 1

State the assumption.

---

## Output Format

Print the full TAM brief in-chat. No preamble. Use this exact structure.

---

### TAM: [Sector / Niche]
**Geography:** [US / North America / Global] | **Segment:** [SMB / Mid-Market / Enterprise / Mixed]

---

**THE MATH**

| Step | Value | Source / Assumption |
|------|-------|---------------------|
| Total US market revenue | $[X]B | [source or method] |
| Avg. revenue per company | $[X]M | [assumption] |
| Raw company count | ~[X,000] | Revenue ÷ Avg |
| Reachability discount | [X]% | [reason] |
| Reachable companies | ~[X,000] | After discount |
| Decision makers per co. | [X] | [assumption] |
| **Total addressable contacts** | **~[X,000]** | |

---

**VERDICT**

Write 2–3 sentences summarizing the TAM in plain language. State the reachable company count and total contact estimate, then give a directional read on viability — don't force a label on it.

As a rough guide: markets with 10,000+ contacts generally have enough headroom for cold email. Markets under 10,000 contacts aren't necessarily off the table, but flag it — list exhaustion becomes a real constraint and the campaign will need to be tighter.

---

**TARGET DECISION-MAKER TITLES**
List the 2–4 most likely job titles to target when building this list (e.g., VP of Operations, Director of IT, Owner/Founder). Note which titles are most commonly the economic buyer vs. the champion.

---

**KEY ASSUMPTIONS**
Bullet list of the 3–5 most important assumptions. Flag which are most uncertain and what would change the estimate most.

---

**IF TAM IS TIGHT**
*(Only include this section if the contact estimate comes in under 10,000)*

Suggest 1–2 concrete ways to expand:
- Adjacent subsectors that share the same buyer
- Geography expansion
- Company size range adjustment

---

## Rules

- Use real data when findable. Label every number as sourced or estimated.
- Never invent statistics. Reason from first principles and say so when data isn't available.
- Show all math. The point of this exercise is a logical, followable estimate — not just a number.
- Round final figures to avoid false precision ("~8,000" not "8,247").
- If the sector is ambiguous enough to produce a 5× swing in the estimate, ask before proceeding.
- Keep output scannable. Tables over prose.