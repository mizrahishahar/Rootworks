# Matched Landing Pages

**Use: SEND.** One link per detected signal. The signal is already in the list - this is the page that matches it.

Every row below maps a **field we enrich on** to a page built for exactly that answer. Send the matched one, not the homepage.

---

## By helpdesk detected

Adelante's intent signal is "detectable helpdesk". Every common value has a displacement page.

| If their helpdesk is | Send |
|---|---|
| Zendesk | `getadelante.com/alternative-to/zendesk-ai` |
| Gorgias | `getadelante.com/alternative-to/gorgias-ai` |
| Freshdesk | `getadelante.com/alternative-to/freshdesk-ai` |
| Intercom | `getadelante.com/alternative-to/intercom-ai` |
| Chatbase | `getadelante.com/alternative-to/chatbase` |
| HelloRep | `getadelante.com/alternative-to/hellorep` |
| *(index)* | `getadelante.com/alternative-to` |

**This is the highest-leverage match we have.** The case study's own story is "they tried their helpdesk's built-in AI and it failed" - so a prospect running Zendesk AI is not a cold prospect, they are a prospect who already has the problem and does not know there is a better answer.

## By platform detected

Platform is a **must-have** filter on the list, so every lead has this field.

| Platform | English | Hebrew |
|---|---|---|
| Shopify | `/industries/shopify-support` | `/he/industries/shopify-support` |
| WooCommerce | `/industries/woocommerce-support` | `/he/industries/woocommerce-support` |
| Magento | `/industries/magento-support` | `/he/industries/magento-support` |

Also `/shopify` (standalone) and `/apps` (marketplace).

## By pain named

Match the blog post to the ticket type they complained about, or the review we tore down.

| Pain | Send |
|---|---|
| WISMO / "where is my order" | `/blog/ai-support-wismo-tickets` |
| Returns and exchanges | `/blog/ai-support-for-returns-and-exchanges` |
| **Running paid campaigns** (an intent signal) | `/blog/ai-support-dtc-brands-during-campaign-spikes` |
| High-ticket product (the Fold shape) | `/blog/ai-support-for-highticket-ecommerce-brands` |
| Damaged / lost / wrong item | `/blog/ai-support-for-damaged-lost-wrong-item-tickets` |
| Order changes before fulfillment | `/blog/ai-support-order-changes-before-fulfillment` |
| Wants product recommendations / pre-sale | `/blog/ai-product-recommendation-support-ecommerce` |
| On Shopify, generic | `/blog/ai-support-for-shopify-stores` |

## Hebrew surface

Full HE site: `/he` · `/he/pricing` · `/he/security` · `/he/integrations` · `/he/product/{overview,launch,control,improve}` · `/he/about-us`

**The HE homepage's own CTA is the WhatsApp bot** - "נסו את ה-AI Agent בוואטסאפ". For IL outreach, `/he` *is* the bot demo route.

## Other surfaces

| Page | Use |
|---|---|
| `/support-audit` | **60-second self-audit** - eight warning signals (WISMO reaching agents, macro rewrites, bot loops, post-promo backlogs). Real, low-friction, self-serve. |
| `/pricing` · `/he/pricing` | Price questions |
| `/product/overview` | "What does it do" - Resolve / Sell / Hand off / Improve |
| `/security` · `/trust-portal` | The security blocker. SOC 2 Type II, GDPR. |
| `/integrations` | "Does it work with X" |
| `/for-agencies` | **Agencies** - Tamir's past working campaigns targeted exactly this |
| `/tour-operators` | A non-ecommerce vertical page. Out of pilot scope, noted. |
| `/affiliate` | Partner motion |
| **`/quiz`** | **The booking link.** 308-redirects to `cal.com/tamirbashkin/intro-call` ("App Intro Call"). Every CTA on the site points here. |
