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
| archive/AI-Ark-Export---Clayroots | POST https://n8n.flowroots.com/webhook/launch-aiark-contacts | Clayroots Base ID, Build name, AI-Ark contacts CSV (file), Domains Table ID, Existing Table ID, Tag | **yes - launch on Waiting** |
| archive/Airtable-Ops-one-off | POST https://n8n.flowroots.com/webhook/get-view-meta <br> POST https://n8n.flowroots.com/webhook/add-fields-to-table <br> POST https://n8n.flowroots.com/webhook/patch-records <br> POST https://n8n.flowroots.com/webhook/create-records <br> POST https://n8n.flowroots.com/webhook/list-records |  | no |
| archive/Alta-Ops-one-off | POST https://n8n.flowroots.com/webhook/alta-list-prospects <br> POST https://n8n.flowroots.com/webhook/alta-persons <br> POST https://n8n.flowroots.com/webhook/alta-pause-prospects |  | no |
| archive/Append-fields-to-table | POST https://n8n.flowroots.com/webhook/launch-domain-merge | Clayroots Base ID, Table, Key column, Fields to attach, Domain CSV (file) | **yes - launch on Waiting** |
| archive/Backfill-Intent-Fields-one-off | POST https://n8n.flowroots.com/webhook/backfill-intent-fields |  | no |
| archive/Clean-Company-Names-on-table | GET https://n8n.flowroots.com/webhook/clean-company-names-run | Clayroots Base ID, Table ID | no |
| archive/Contagen---Supersoniq---Clayroots | POST https://n8n.flowroots.com/webhook/launch-contagen-supersoniq | Clayroots Base ID, Build name, ContaGen contacts CSV (file), Contact location, Existing Table ID, Tag | **yes - launch on Waiting** |
| archive/Discolike-Domains---Clayroots | POST https://n8n.flowroots.com/webhook/launch-discolike-domains | Clayroots Base ID, Build name, CSV (file), Existing Table ID, Tag | **yes - launch on Waiting** |
| archive/HeyReach-Ops-one-off | POST https://n8n.flowroots.com/webhook/heyreach-call |  | no |
| archive/Stamp-Tag-on-table | GET https://n8n.flowroots.com/webhook/stamp-tag-on-table-run | Clayroots Base ID, Table ID, Tag, Build Date filter (optional) | no |
| archive/Storeleads-Domains---Supersoniq---Clayroots | POST https://n8n.flowroots.com/webhook/launch-storeleads-contacts | Clayroots Base ID, Build name, Storeleads domains CSV (file), Contact location, Existing Table ID, Tag | **yes - launch on Waiting** |
| archive/Verify-Emails | POST https://n8n.flowroots.com/webhook/launch-verify-emails | Clayroots Base ID, Table, Max Rows, View | no |
| archive/Waterfall-Emails | POST https://n8n.flowroots.com/webhook/waterfall-record <br> POST https://n8n.flowroots.com/webhook/launch-waterfall-emails | Clayroots Base ID, Table, Max Rows, View | no |
| helpers/Alta-OAuth-Callback | GET https://n8n.flowroots.com/webhook/alta-oauth-callback |  | no |
| helpers/Get-Availability | GET https://n8n.flowroots.com/webhook/availability |  | no |
| rootflows/Discover-Discolike-Companies/Discover-Discolike-Companies | POST https://n8n.flowroots.com/webhook/discover-discolike-companies |  | no |
| rootflows/Discover-Hiring-Companies/Insert-Hiring-domains-to-Clayroots | POST https://n8n.flowroots.com/webhook/intent-signal |  | no |
| rootflows/Discover-Reviews-Companies/Insert-Reviews-domains-to-Clayroots | POST https://n8n.flowroots.com/webhook/service-reviews-intent-signal |  | no |
| rootflows/Discover-Storeleads-Companies/Insert-Storeleads-domains-to-Clayroots | POST https://n8n.flowroots.com/webhook/launch-insert-storeleads-domains |  | no |
| rootflows/Enrich-Contacts/Enrich-Contacts | POST https://n8n.flowroots.com/webhook/enrich-contacts |  | no |
| rootflows/Enrich-Emails/Enrich-Emails | POST https://n8n.flowroots.com/webhook/enrich-emails |  | no |
| rootflows/Verify-Catch-alls/Verify-Catch-alls | POST https://n8n.flowroots.com/webhook/verify-catch-alls |  | no |
| rootflows/Waterfall-Phones/Waterfall-Phones | POST https://n8n.flowroots.com/webhook/launch-waterfall-phones <br> POST https://n8n.flowroots.com/webhook/waterfall-phones |  | no |
| rootworks/Allocate-inboxes-in-PlusVibe-by-tags | POST https://n8n.flowroots.com/webhook/allocate-inboxes-by-tag |  | no |
| rootworks/Create-Client-Rootworks-Infrastructure | GET https://n8n.flowroots.com/webhook/client/onboard |  | no |
| rootworks/Create-PlusVibe-Report | POST https://n8n.flowroots.com/webhook/launch-pv-weekly-report |  | no |
| rootworks/Create-health-report-for-inboxes | POST https://n8n.flowroots.com/webhook/launch-inbox-health |  | no |
| rootworks/Deploy-View-to-Alta-Campaign | POST https://n8n.flowroots.com/webhook/deploy-view-to-alta |  | no |
| rootworks/Deploy-View-to-Email-Bison-Campaign | POST https://n8n.flowroots.com/webhook/deploy-view-to-bison-campaign |  | no |
| rootworks/Deploy-View-to-HeyReach-Campaign | POST https://n8n.flowroots.com/webhook/deploy-view-to-heyreach |  | no |
| rootworks/Deploy-View-to-PlusVibe-Campaign | POST https://n8n.flowroots.com/webhook/deploy-view-to-campaign |  | no |
| rootworks/Enrich-Qualify-new-lead-from-Alta | POST https://n8n.flowroots.com/webhook/alta-dave-new-reply |  | no |
| rootworks/Enrich-Qualify-new-lead-from-Booking | POST https://n8n.flowroots.com/webhook/booking/cal <br> POST https://n8n.flowroots.com/webhook/booking/manual |  | no |
| rootworks/Enrich-Qualify-new-lead-from-Email-Bison | POST https://n8n.flowroots.com/webhook/bison-new-reply <br> POST https://n8n.flowroots.com/webhook/newlead-manual-bison |  | no |
| rootworks/Enrich-Qualify-new-lead-from-PlusVibe | POST https://n8n.flowroots.com/webhook/plusvibe-new-reply <br> POST https://n8n.flowroots.com/webhook/newlead-manual |  | no |
| rootworks/Handle-another-meeting-for-flowroots | POST https://n8n.flowroots.com/webhook/9851c15f-256a-425c-9771-8690be97bf8b |  | no |
| rootworks/Handle-new-discovery-for-flowroots | POST https://n8n.flowroots.com/webhook/34c8c9bb-e57d-4115-a0f8-d2c906e4dec8 |  | no |
| rootworks/Pull-campaign-opens-for-adelante | POST https://n8n.flowroots.com/webhook/addon-pvsync-adelante |  | no |
| rootworks/Scaffold-Client-Base | POST https://n8n.flowroots.com/webhook/launch-scaffold-client-base |  | no |
| rootworks/Sync-Alta-Campaigns-to-Hub | POST https://n8n.flowroots.com/webhook/launch-sync-alta-campaigns |  | no |
| rootworks/Sync-Email-Bison-Campaigns-to-Hub | POST https://n8n.flowroots.com/webhook/launch-sync-bison-campaigns |  | no |
| rootworks/Sync-Meeting-Summaries-to-Vault | POST https://n8n.flowroots.com/webhook/e4521a14-e7f8-4b18-844f-2e76a6573931 |  | no |
| rootworks/Sync-Not-Interested-to-DNC | POST https://n8n.flowroots.com/webhook/launch-sync-not-interested |  | no |
| rootworks/Sync-PlusVibe-Campaigns-to-Hub | POST https://n8n.flowroots.com/webhook/launch-sync-pv-campaigns |  | no |
| rootworks/Sync-PlusVibe-Inboxes-to-Hub | POST https://n8n.flowroots.com/webhook/launch-sync-pv-inboxes |  | no |
| rootworks/Sync-PlusVibe-Leads-to-Clayroots | POST https://n8n.flowroots.com/webhook/launch-sync-pv-leads |  | no |
| rootworks/Sync-Slack-Logs-to-Vault | POST https://n8n.flowroots.com/webhook/launch-sync-slack-logs |  | no |
| rootworks/Sync-Tool-Credits-to-Hub | POST https://n8n.flowroots.com/webhook/launch-sync-tool-credits |  | no |
