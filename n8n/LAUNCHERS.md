# Launchers

Every webhook-launchable machine, compiled from the trigger nodes in `n8n/` by `scripts/launchers.js`.
Do not hand-edit; rerun the script after every pull.

- **Fire** is the exact request that starts the machine.
- **Fields** is what the run needs (from the machine's own launch form); fill only these.
- **Attachment: yes** means the machine takes a file, and a file cannot be sent by API:
  create the Hub Automations row with Status = Waiting and every other field filled,
  then stop. The Operator attaches the file and clears the Status himself, which fires the run.

| Machine | Fire | Fields | Attachment |
|---|---|---|---|
| AI-Ark-Export---Clayroots | POST https://n8n.flowroots.com/webhook/launch-aiark-contacts | Clayroots Base ID, Build name, AI-Ark contacts CSV (file), Domains Table ID, Existing Table ID, Tag | **yes - launch on Waiting** |
| Add-rank-in-company-to-table | POST https://n8n.flowroots.com/webhook/launch-rank-in-company | Clayroots Base ID, Table ID, View ID | no |
| Alta-OAuth-Callback | GET https://n8n.flowroots.com/webhook/alta-oauth-callback |  | no |
| Append-fields-to-table | POST https://n8n.flowroots.com/webhook/launch-domain-merge | Clayroots Base ID, Table ID, Key column, Fields to attach, Domain CSV (file) | **yes - launch on Waiting** |
| Clean-Company-Names-on-table | GET https://n8n.flowroots.com/webhook/clean-company-names-run | Clayroots Base ID, Table ID | no |
| Contagen---Supersoniq---Clayroots | POST https://n8n.flowroots.com/webhook/launch-contagen-supersoniq | Clayroots Base ID, Build name, ContaGen contacts CSV (file), Contact location, Existing Table ID, Tag | **yes - launch on Waiting** |
| Deploy-View-to-Campaign | POST https://n8n.flowroots.com/webhook/deploy-view-to-campaign |  | no |
| Discolike-Domains---Clayroots | POST https://n8n.flowroots.com/webhook/launch-discolike-domains | Clayroots Base ID, Build name, CSV (file), Existing Table ID, Tag | **yes - launch on Waiting** |
| Handle-Intent-Signal | POST https://n8n.flowroots.com/webhook/intent-signal |  | no |
| Handle-New-Lead-from-Alta | POST https://n8n.flowroots.com/webhook/alta-dave-new-reply |  | no |
| Handle-New-Lead-from-PlusVibe | POST https://n8n.flowroots.com/webhook/plusvibe-new-reply <br> POST https://n8n.flowroots.com/webhook/newlead-manual |  | no |
| Handle-another-meeting-for-flowroots | POST https://n8n.flowroots.com/webhook/9851c15f-256a-425c-9771-8690be97bf8b |  | no |
| Handle-new-discovery-for-flowroots | POST https://n8n.flowroots.com/webhook/34c8c9bb-e57d-4115-a0f8-d2c906e4dec8 |  | no |
| Onboard-Client | GET https://n8n.flowroots.com/webhook/client/onboard |  | no |
| Pull-campaign-opens-for-adelante | POST https://n8n.flowroots.com/webhook/addon-pvsync-adelante |  | no |
| Stamp-Tag-on-table | GET https://n8n.flowroots.com/webhook/stamp-tag-on-table-run | Clayroots Base ID, Table ID, Tag, Build Date filter (optional) | no |
| Storeleads-Domains---Clayroots | POST https://n8n.flowroots.com/webhook/launch-storeleads-domains | Clayroots Base ID, Build name, Country, Platforms (tick any; none = all platforms), Plan, Monthly revenue, Employees, Product count, Store age, Min monthly visits, Category, Technologies, Must-have app IDs (comma-separated, platform.token format, e.g. shopify.klaviyo-email-marketing), Max companies, Existing Table ID, Tag | no |
| Storeleads-Domains---Supersoniq---Clayroots | POST https://n8n.flowroots.com/webhook/launch-storeleads-contacts | Clayroots Base ID, Build name, Storeleads domains CSV (file), Contact location, Existing Table ID, Tag | **yes - launch on Waiting** |
| Sync-Meeting-Summaries-to-Vault | POST https://n8n.flowroots.com/webhook/e4521a14-e7f8-4b18-844f-2e76a6573931 |  | no |
| Verify-Emails | POST https://n8n.flowroots.com/webhook/launch-verify-emails | Clayroots Base ID, Table ID, Max Rows, View | no |
| Waterfall-Emails | POST https://n8n.flowroots.com/webhook/waterfall-record <br> POST https://n8n.flowroots.com/webhook/launch-waterfall-emails | Clayroots Base ID, Table ID, Max Rows, View | no |
