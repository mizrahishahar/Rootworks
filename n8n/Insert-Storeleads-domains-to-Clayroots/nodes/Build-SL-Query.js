// Build SL Query: the launch row's filters become one Storeleads pull query per provider x
// country. Max companies (already validated by Launch Params) is the spend cap the loop
// enforces; the batch pulls only what is still short of it.
const lp = $('Launch Params').first().json;
const CMAP = {'United States':'US','United Kingdom':'GB','Canada':'CA','Australia':'AU','Ireland':'IE','Israel':'IL','Germany':'DE','France':'FR','Netherlands':'NL','usa':'US','us':'US','uk':'GB','england':'GB'};
const asArr=(v)=>{ if(v===undefined||v===null||v==='')return[]; if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean); return String(v).split(',').map(s=>s.trim()).filter(Boolean); };
const toCode=(x)=>{ const s=String(x).trim(); if(CMAP[s])return CMAP[s]; if(CMAP[s.toLowerCase()])return CMAP[s.toLowerCase()]; if(/^[A-Za-z]{2}$/.test(s))return s.toUpperCase(); return ''; };
const ccList = Array.from(new Set(asArr(lp.country).map(toCode).filter(Boolean)));
const ALLOWED = ['shopify','woocommerce','bigcommerce','wix','squarespace','magento'];
let selP = asArr(lp.platforms).map(s=>String(s).toLowerCase()).filter(s=>ALLOWED.includes(s));
const planTicked = asArr(lp.plan).includes('Shopify Plus');
if (planTicked) selP = ['shopify'];
const providers = selP.length ? Array.from(new Set(selP)) : ['all'];
const maxCompanies = parseInt(lp.maxCompanies, 10);
if (!Number.isFinite(maxCompanies) || maxCompanies < 1) { throw new Error('Max companies is missing or not a positive number. It is the Storeleads spend cap. Nothing was pulled.'); }
const baseFilters = { 'f:state': 'Active' };
if (planTicked) baseFilters['f:plan'] = 'Shopify Plus';
const envelope=(ticked, ORDER, MAP)=>{ const s=ticked.filter(b=>MAP[b]); if(!s.length) return [null,null]; const idxs=s.map(b=>ORDER.indexOf(b)).filter(i=>i>=0).sort((a,b)=>a-b); return [MAP[ORDER[idxs[0]]][0], MAP[ORDER[idxs[idxs.length-1]]][1]]; };
const REV_ORDER=['Under $10k','$10k-50k','$50k-100k','$100k-500k','$500k-1M','$1M+'];
const REV={'Under $10k':[null,1000000],'$10k-50k':[1000000,5000000],'$50k-100k':[5000000,10000000],'$100k-500k':[10000000,50000000],'$500k-1M':[50000000,100000000],'$1M+':[100000000,null]};
const rev=envelope(asArr(lp.monthlyRevenue),REV_ORDER,REV);
if(rev[0]!=null)baseFilters['f:ermin']=String(rev[0]); if(rev[1]!=null)baseFilters['f:ermax']=String(rev[1]);
const EMP_ORDER=['1-10','11-50','51-200','200+'];
const EMP={'1-10':[1,10],'11-50':[11,50],'51-200':[51,200],'200+':[200,null]};
const emp=envelope(asArr(lp.employees),EMP_ORDER,EMP);
if(emp[0]!=null)baseFilters['f:empcmin']=String(emp[0]); if(emp[1]!=null)baseFilters['f:empcmax']=String(emp[1]);
const PC_ORDER=['1-50','51-500','500+'];
const PC={'1-50':[1,50],'51-500':[51,500],'500+':[500,null]};
const pc=envelope(asArr(lp.productCount),PC_ORDER,PC);
if(pc[0]!=null)baseFilters['f:pcmin']=String(pc[0]); if(pc[1]!=null)baseFilters['f:pcmax']=String(pc[1]);
const iso=(d)=>d.toISOString().slice(0,19)+'Z';
const now=new Date();
const yearsAgo=(y)=>{ const d=new Date(now.getTime()); d.setUTCFullYear(d.getUTCFullYear()-y); return d; };
const AGE_ORDER=['Under 1 year','1-3 years','3+ years'];
const AGE={'Under 1 year':[0,1],'1-3 years':[1,3],'3+ years':[3,null]};
const ageTicked=asArr(lp.storeAge).filter(b=>AGE[b]);
if(ageTicked.length){ const aidx=ageTicked.map(b=>AGE_ORDER.indexOf(b)).filter(i=>i>=0).sort((a,b)=>a-b); const minAge=AGE[AGE_ORDER[aidx[0]]][0]; const maxAge=AGE[AGE_ORDER[aidx[aidx.length-1]]][1]; if(maxAge!=null)baseFilters['f:cratmin']=iso(yearsAgo(maxAge)); if(minAge>0)baseFilters['f:cratmax']=iso(yearsAgo(minAge)); }
const minVisits = parseInt(lp.minMonthlyVisits, 10);
if (Number.isFinite(minVisits) && minVisits > 0) baseFilters['f:evmin'] = String(minVisits);
const catList = asArr(lp.category);
if (catList.length) { baseFilters['f:cat'] = catList.join(','); baseFilters['f:cat:op'] = 'or'; }
const techList = asArr(lp.technologies);
if (techList.length) { baseFilters['f:tech'] = techList.join(','); baseFilters['f:tech:op'] = 'and'; }
const appIds = asArr(lp.mustHaveAppIds);
if (appIds.length) { baseFilters['f:an']=appIds.join(','); baseFilters['f:an:op']='and'; }
const fields = 'name,tld1,merchant_name,title,description,categories,country_code,city,administrative_area_level_1,estimated_sales,employee_count,rank,platform,state,plan,created_at,product_count,monthly_app_spend,apps,technologies,trustpilot,last_platform,last_platform_change_at,features,contact_info';
const cList = ccList.length ? ccList : [null];
const out=[];
for(const prov of providers){ for(const cc of cList){ const f = Object.assign({}, baseFilters); if(cc) f['f:cc']=cc; const pullQuery = Object.assign({}, f, { page_size: 50, sort: 'rank', fields }); out.push({ json: { _provider: prov, _country: cc||'ALL', countryCode: cc||'', _ccList: ccList, pullQuery, maxCompanies, providerCount: providers.length, countryCount: cList.length } }); } }
return out;
