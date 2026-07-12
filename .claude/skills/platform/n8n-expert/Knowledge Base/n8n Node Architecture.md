# n8n Node Architecture

Core knowledge about how n8n workflows are structured, what nodes exist, and how to use them well. For live parameter schemas and version-specific docs, always pull from Context7.

---

## Workflow Anatomy

Every workflow has exactly one trigger. The trigger determines when and how the workflow fires. Everything else is a chain of processing nodes that ends with a write to a system of record.

---

## Trigger Types

| Trigger          | When to use                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Webhook          | External system fires an event (Calcom booking, Airtable change, form submit from another tool) |
| Form Trigger     | Manual kick-off with structured input — give Shahar a simple form to paste an ID                |
| Schedule (Cron)  | Time-based polling or batch jobs — runs every N minutes/hours/days                              |
| Airtable trigger | React to record creation or update in Airtable                                                  |
| Email trigger    | Inbound email matching a sender or subject pattern                                              |

---

## Core Node Types

**Airtable** — read and write to Flowroots CRM. Source of truth for all prospect and contact data. Use for: get record by ID, create record, update record, list records with filters.

**Google Drive** — create folders, upload files, move files. Used to create per-prospect folders at initialization and to store meeting recordings.

**HTTP Request** — call any external API without a native n8n node. Auth via header or bearer token. Used for: Brandfetch branding data, custom webhooks, any undocumented API.

**Code (JavaScript)** — pure data transformation. Use to reshape, map, filter, or extract fields between nodes. Do not use for API calls or AI logic.

**Wait** — pause execution for N seconds. Use between batched Airtable writes and between consecutive AI Agent calls to avoid rate limit errors.

**AI Agent (langchain.agent)** — an LLM with optional tools (web search, code execution). Use for open-ended research tasks. The Tools Agent variant implements Langchain's tool calling interface and has improved output parsing. Pair with a Structured Output Parser when the final output needs a specific JSON shape.

**Structured Output Parser (langchain.outputParserStructured)** — enforces a JSON schema on the AI Agent's **final** output. Sub-node of the AI Agent. Not for structuring intermediary steps — if you need a specific format mid-chain, put the schema instruction in the agent's system message instead.

**OpenAI Chat Model (langchain.lmChatOpenAi)** — the LLM powering an AI Agent or chain. Select model per task: gpt-5 with web search for contact research; gpt-5.1 for longer research tasks; lighter models for classification.

**Set / Edit Fields** — assign or rename fields on items passing through. Lightweight alternative to a Code node for simple remapping.

**Split In Batches** — process items one at a time or in controlled batch sizes. Use before loops over multiple Airtable records.

---

## AI Agent Patterns

**Research + structured output**
AI Agent (with web search) → Structured Output Parser (JSON schema) → Code node (flatten) → Airtable create/update

**Classification**
AI Agent (no tools, short prompt) → Set node (write classification field) → Airtable update

**Text generation, stored result**
AI Agent (no tools) → Airtable update (store output text in a long-text field)

**What does NOT belong in an AI Agent node inside n8n:**
- Multi-turn conversations
- Tasks where the output needs Shahar's review before moving
- Tasks where the right next step depends on the content of the output (that is conditional logic on judgment — belongs in Claude Code)

---

## Using Context7 for Node Docs

Always pull live n8n documentation via Context7 before answering any node-specific question — parameter names, auth setup, versions. Never guess. n8n node schemas are version-sensitive and change across releases.

---

## Quality Rules

- Every node gets a clear descriptive name — never leave 'HTTP Request3' or 'Code1'
- Wait nodes go between every pair of consecutive Airtable writes and between AI Agent calls
- AI prompts specify an explicit output format — the agent should never dump free-form text into a record field without a parser
- External API calls (HTTP Request) should have an error path or at minimum be noted as failure points
- Workflows end with a write node — data must land in Airtable, Drive, or Obsidian; it does not live in n8n