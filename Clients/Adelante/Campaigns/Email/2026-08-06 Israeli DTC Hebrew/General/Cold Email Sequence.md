---
Type: Sequence
client: Adelante
segment: Israeli DTC Hebrew - General
channel: email
playbook: pitch-led
updated: 2026-08-09
---

# Cold Email Sequence

**Audience:** Israeli DTC ecommerce, general. Bot-agnostic and vertical-agnostic by design.
**Shape:** 4 / 1 · **Tokens:** {{first_name_he}}, {{company_name}}, {{sender_first_name}}
**Sender:** PlusVibe, workspace Flowroots X Adelante.
**Live campaign:** `6a785c53e6166f464988819f` — built as a draft 2026-08-09.

**This replaces the four 2026-07-16 Hebrew campaigns for all new leads.** Those four (General/Fashion x Has-Bot/No-Bot) differed by roughly six words and split a small list four ways; one of them reached a single person. The four stay live for the leads already in them.

**What changed from the old four**

| | Old | Here |
|---|---|---|
| Bot assumption | Has-Bot variants opened on `{{bot_app}}` | None. Bot-agnostic |
| Platform | Shopify hardcoded | Dropped. "מהחנות שלכם" |
| Proof | Modibodi at 70% | Papaya, 200 to 400 of every 1,000 closing with no human |
| Guarantee | none | חצי מהפניות מהיום הראשון, או שלא משלמים |
| CTA | reply yes and I send a WhatsApp number | a first version built here over email |
| Opt-out | `נ.ב. השיבו הסר` in the body | still in the body. The Hebrew signature was rebuilt 2026-08-09 and deliberately carries no P.S., so the opt-out lives in the copy |

The 70% was the reason for the swap as much as the angle: the case study page says 50%, the onboarding form says 70%, and the asset note says use 50. Papaya replaces it because the demand-gen frame needs a number phrased as closing, and Papaya's is the only one we have.

**Deployment notes.** Bodies are wrapped in `<div dir="rtl" style="text-align:right;">` so Hebrew renders right to left in the client. **No spintax on this campaign**, by decision. Open tracking is ON for this campaign. It sends from **six Hebrew inboxes only**, three domains kept in pairs: easyadelante.com, hiadelante.com, getadelanteagent.com. Schedule is Sunday to Thursday, 07:00 to 14:00 Asia/Jerusalem.

**Open items.** The A/B tests the subject line only, not the opener, which is what the playbook would normally vary. The six inboxes are shared with the four older Hebrew campaigns, so volume needs watching until those wind down.

---

## Email 1

Four variants: two subjects crossed with the proof line, testing whether the 1,500-inquiry volume helps or hurts. Papaya was removed on 2026-08-09 — Tamir ruled it out on the 2026-07-23 call (their data is weak because the CRM was never connected) and gave Modibodi at 75% on ~1,500 inquiries a month instead.

- **1A** הפניות שחוזרות על עצמן ב{{company_name}} · with volume
- **1B** שאלה {{first_name_he}} · with volume
- **1C** הפניות שחוזרות על עצמן ב{{company_name}} · percentage only
- **1D** שאלה {{first_name_he}} · percentage only

היי {{first_name_he}},

אם רוב הפניות של {{company_name}} חוזרות על עצמן: סטטוס הזמנה, החזרות וזמינות - זה בטח מציף אתכם, וכתוצאה מכך רוכשים מחכים לתשובה, ובינתיים סוגרים במקום אחר.

בנינו נציג AI שסוגר את הפניות האלה מקצה לקצה: קורא את הנתונים מהחנות שלכם וגם מבצע פעולות אמיתיות כמו בדיקת סטטוס, החזרה והחלפה.

אצל Modibodi, על כ-1,500 פניות בחודש, הנציג סוגר 75% מהן בלי נציג אנושי.

*(Variants C and D drop the volume and read: אצל Modibodi הנציג סוגר 75% מהפניות בלי נציג אנושי.)*

אני מספיק בטוח בו כדי להתחייב: חצי מהפניות שלכם ייסגרו החל מהיום הראשון, או שאתם לא משלמים.

אני יכול לבנות לכם גרסה ראשונית לנסות, כאן במייל, רוצים?

*[signature]*

נ.ב. אין התחייבות כמובן. פשוט תנסו ותגידו לי מה דעתכם

---

## Email 2 — threaded, no new subject

{{first_name_he}}, אנחנו מציעים את זה רק לחנויות עם נפח פניות אמיתי, כי שם זה מורגש בהכנסות.

מאותה סיבה אנחנו גם מתחייבים: חצי מהפניות נסגרות מהיום הראשון, או שלא משלמים.

אם נפעל עכשיו, אפשר להעלות את הנציג לאוויר עוד לפני תקופת החגים, בדיוק כשזה הכי קריטי.

מה סוג הפנייה שהכי מציפה אתכם כרגע? אני אמקד בה את הגרסה הראשונית ואשלח לכם אותה כאן.

*[signature]*

נ.ב. אם זה לא רלוונטי כרגע, אפשר להגיד לנו.
