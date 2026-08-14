const briefRows = $("Read Brief Tab").all();
const brief = {};
for (const item of briefRows) { brief[item.json.field] = item.json.value; }

const dmRows = $input.all().map(i => i.json);
const sheetId = $("Find Decision Makers Sheet").item.json.id;
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

const tableLines = dmRows.map(r => {
  const dm = `${r.first_name || ''} ${r.last_name || ''}, ${r.title || ''}`.trim();
  return `| ${r.company_name || ''} | ${dm} | ${r.email || ''} |`;
}).join("\n");

const prompt = `Apply the following substitutions to the template. Do not modify any other content on any card.

VARIABLE SUBSTITUTIONS (replace every occurrence, case-sensitive):

[Company] -> ${brief.Brand}
[X] (only in the lead-list section) -> ${brief.Companies}
[Y] (only in the lead-list section) -> ${brief.Contacts}
[vertical/sub-vertical] -> ${brief.Niche}
[decision-makers] -> ${brief.Roles}
[ICP companies] -> ${brief.ICP}
[One Liner Explanation about their characteristics] -> ${brief.Focus}
[Sheet] -> ${sheetUrl}

TABLE FILL:

In the lead-list card, the empty table with columns "Company | Decision Maker | Email" should be replaced by exactly the following rows. Keep the column headers. Do not reformat the content of any cell.

| Company | Decision Maker | Email |
${tableLines}

DO NOT TOUCH the following sections - leave their content exactly as it appears in the template:
- The four sub-cards under "Day 1: First email, 4 versions"
- The two sub-cards under "Day 4: Follow-up, 2 versions"
- The two sub-cards under "Day 9: Final follow-up, 2 versions"
- The BONUS Cold Offer card (the blockquote stays as-is)
- The "[Company]'s Sending Domains" card body
- The inbox table inside the "[Company]'s Inboxes" card
- The "Domain 1" reference in the inbox table caption
- All FAQ accordions
- The "Who I Am" card

DO NOT add, remove, reorder, merge, or split any cards.
DO NOT generate new content for empty sections.
DO NOT improve, rephrase, or shorten any existing text.

If a placeholder cannot be substituted, leave it as-is. Do not invent values.`;

return [{ json: { prompt, sheetId, sheetUrl, brand: brief.Brand } }];