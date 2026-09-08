// Fresh Service Complaints: the glue between two rented scrapers, per the architecture
// settled with the Operator 2026-09-06 and tightened 2026-09-07.
//
//   STEP 1 (feed): for each Trustpilot category, read the category page sorted by
//     latest review - the stores reviewed since yesterday, across the WHOLE category.
//     SIZE FILTER: skip any store whose total review count is above maxCompanyTotalReviews
//     (the review-firehose giants: IKEA, Fabletics, Vinted, Overstock...). Cutting them
//     here, before spending, means the budget reaches deeper into the mid-market where
//     Adelante's real DTC buyers live, and no IKEA ever reaches the handler.
//   STEP 2 (filter): for the survivors, in batches of 10, fetch only 1-2 star reviews
//     tagged customer_service within the lookback window. Silent stores cost nothing.
//   OUTPUT: one dataset of review rows + company metadata rows, the exact shape the
//     n8n handler (Insert Reviews domains to Clayroots) parses. The scheduled task's
//     webhook posts { play, resource } to the handler; this actor never calls n8n itself.
//
// Both children are blackfalcondata/trustpilot-reviews-scraper, the actor proven live.
// Batch size 10 is that actor's hard companyDomains cap - never raise it.
// Every child call carries maxTotalChargeUsd; this actor does no unbounded work.
import { Actor, log } from 'apify';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const {
  categories = ['https://www.trustpilot.com/categories/clothing_store'],
  feedPagesPerCategory = 12,
  maxCompanyTotalReviews = 8000,
  lookbackDays = 2,
  stars = [1, 2],
  topics = ['customer_service'],
  maxReviewsPerCompany = 20,
  reviewBatchSize = 10,
  childMaxChargeUsd = 1,
  maxDomainsPerRun = 1500,
  scraperActor = 'blackfalcondata/trustpilot-reviews-scraper',
} = input;

const client = Actor.apifyClient;

async function callChild(runInput) {
  const run = await client.actor(scraperActor).call(runInput, { maxTotalChargeUsd: childMaxChargeUsd });
  if (run.status !== 'SUCCEEDED') throw new Error(`child run ${run.id} ended ${run.status}`);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

// STEP 1: the feeds, with the size filter applied as each category is read.
const seen = new Set();
const domains = [];
let skippedTooBig = 0;
for (const cat of categories) {
  const url = cat.includes('sort=') ? cat : cat + (cat.includes('?') ? '&' : '?') + 'sort=latest_review';
  let items = [];
  try {
    items = await callChild({
      mode: 'categories',
      categoryUrl: url,
      searchMaxPages: feedPagesPerCategory,
      maxResults: feedPagesPerCategory * 12,
    });
  } catch (e) {
    log.error(`feed failed for ${url}: ${e.message}`);
    continue; // one broken category never kills the morning
  }
  let added = 0;
  for (const it of items) {
    const d = String(it.companyDomain || '').toLowerCase().replace(/^www\./, '').trim();
    if (!d || seen.has(d)) continue;
    const total = Number(it.totalReviews || 0);
    if (maxCompanyTotalReviews > 0 && total > maxCompanyTotalReviews) { skippedTooBig++; seen.add(d); continue; }
    seen.add(d); domains.push(d); added++;
  }
  log.info(`feed ${url}: ${items.length} rows, ${added} kept, ${skippedTooBig} skipped as too big (${domains.length} total)`);
  if (domains.length >= maxDomainsPerRun) { log.warning(`hit maxDomainsPerRun ${maxDomainsPerRun}, stopping feeds`); break; }
}

// STEP 2: the filter.
let reviewCount = 0;
const companiesWithComplaints = new Set();
const failedBatches = [];
for (let i = 0; i < Math.min(domains.length, maxDomainsPerRun); i += reviewBatchSize) {
  const batch = domains.slice(i, i + reviewBatchSize);
  let items = [];
  try {
    items = await callChild({
      mode: 'reviews',
      companyDomains: batch,
      stars,
      topics,
      lookbackDays,
      maxResults: maxReviewsPerCompany,
      sort: 'recency',
      compact: false,
      includeCompanyInfo: true,
    });
  } catch (e) {
    failedBatches.push({ at: i, reason: e.message });
    log.error(`review batch at ${i} failed: ${e.message}`);
    continue;
  }
  if (items.length) {
    await Actor.pushData(items);
    for (const it of items) {
      if (it.rating !== undefined && it.rating !== null) {
        reviewCount++;
        companiesWithComplaints.add(String(it.companyDomain || '').toLowerCase());
      }
    }
  }
  log.info(`reviews ${Math.min(i + batch.length, domains.length)}/${domains.length}: +${items.length} items`);
}

const summary = {
  categories: categories.length,
  storesInFeeds: domains.length,
  skippedTooBig,
  freshNegativeServiceReviews: reviewCount,
  companiesWithComplaints: companiesWithComplaints.size,
  failedBatches: failedBatches.length,
};
log.info(`DONE ${JSON.stringify(summary)}`);
await Actor.setValue('SUMMARY', { ...summary, failedBatches });
await Actor.exit();
