// Shared origin: a verbatim copy of n8n/Onboard-Client/nodes/Scaffold-Register.js. Onboard Client
// is the source; change it there and copy here (n8n cannot reference a code file across folders).
// Scaffold Register: the List Building 2.0 field register (Flowroots/Operations/List Building
// 2.0.md, "Fields"), the one copy Onboard Client scaffolds a client base from. Pure data, read
// twice: Create ClayRoots Base seeds the new base with Companies' plain fields (the seed), and
// Plan Scaffold Pass walks the whole register every pass. Table descriptions stay empty: the
// description is reserved for the share link. Views and the two synced mirrors ("<Client>
// Campaigns", "<Client> Signals") are the Operator's manual act, never made here.
//
// Field kinds. plain: type + options, created with its table or as a column. formula: refs are
// field names on the same table, swapped for field ids at plan time. link: to a register table.
// mirrorLink: to the client's synced mirror when the base carries it, else a counted skip.
// lookup / count / rollup: through a link, resolved by the linked table's id, never by name.
const SEL=(choices)=>({ choices: choices.map(c=>typeof c==='string'?{name:c}:c) });
const txt=(name)=>({ name, kind:'plain', type:'singleLineText' });
const long=(name)=>({ name, kind:'plain', type:'multilineText' });
const sel=(name,choices)=>({ name, kind:'plain', type:'singleSelect', options:SEL(choices) });
const dt=(name)=>({ name, kind:'plain', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } });
const day=(name)=>({ name, kind:'plain', type:'date', options:{ dateFormat:{name:'iso'} } });
const num=(name)=>({ name, kind:'plain', type:'number', options:{ precision:0 } });
const chk=(name)=>({ name, kind:'plain', type:'checkbox', options:{ color:'greenBright', icon:'check' } });
const url=(name)=>({ name, kind:'plain', type:'url' });
const formula=(name,f,refs)=>({ name, kind:'formula', formula:f, refs:refs||[] });

// The email lane, today's lane verbatim on both tables (the waterfall is untouched). Choices and
// colors exactly as Waterfall Emails declares them (Field List). Email itself sits in each
// table's own order below.
const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'verifying',color:'blueBright'},{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const SRC=[{name:'P0',color:'blueBright'},{name:'P1',color:'cyanBright'},{name:'P2',color:'tealBright'},{name:'P3',color:'purpleBright'},{name:'none',color:'grayBright'}];
const ST=[{name:'done',color:'greenBright'},{name:'verifying',color:'blueBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}];
const LANE=()=>[ sel('MV P0',MV), txt('P1 (Trykitt)'), sel('MV P1',MV), txt('P2 (LeadMagic)'), sel('MV P2',MV), txt('P3 (Prospeo)'), sel('MV P3',MV), sel('BB',BB), txt('Final Email'), sel('Email Source',SRC), sel('Status',ST) ];

// The machine fields the leads sync and the deploy doors write, as Sync PlusVibe Leads declares them.
const MACHINE=()=>[ num('Messages Sent'), dt('Last Contacted'), sel('Campaign Status',['NEVER_CONTACTED','IN_SEQUENCE','COMPLETED','REPLIED','BOUNCED','UNSUBSCRIBED']), txt('Bounce Reason'), dt('Synced At'), txt('Deploy Error') ];

const EMPLOYEES=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const SENIORITY=['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified'];
// Department: Dave's live list, the register (ruled 2026-09-02); Build People in Waterfall Contacts Batch maps into it.
const DEPARTMENT=['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC'];

// relevance: the placeholder the Operator replaces per client with the client's buyer branches.
const RELEVANCE='IF({manually_approved}, 1, 0)';
// linkedin_name_match: 1 when the LinkedIn URL slug (after /in/, letters only) contains the
// cleaned first or last name (letters only), else 0. Blank name or blank URL is 0.
const SLUG='REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")';
const NAME=(f)=>'REGEX_REPLACE(LOWER({'+f+'}), "[^a-z]", "")';
const HIT=(f)=>'AND(LEN('+NAME(f)+') > 0, FIND('+NAME(f)+', '+SLUG+') > 0)';
const LINKEDIN_NAME_MATCH='IF(AND({LinkedIn URL}, OR({first_name}, {last_name})), IF(OR('+HIT('first_name')+', '+HIT('last_name')+'), 1, 0), 0)';

const COMPANIES={ name:'Companies', primary:'Domain', fields:[
  txt('Domain'), txt('Company'), long('Description'), txt('Industry Groups'), txt('Business Model'),
  sel('Employees',EMPLOYEES), txt('Revenue Range'), txt('Keywords'),
  txt('Country'), txt('State'), txt('City'), txt('Street'), txt('Zip'),
  txt('Phones'), txt('Public Emails'), txt('Social URLs'), txt('public_emails_clean'),
  txt('MX Provider'), txt('Redirect Domain'),
  sel('Domain Source',['DiscoLike','Storeleads','Signal','CSV']), txt('Tag'),
  formula('Build Date','CREATED_TIME()'),
  dt('Contacts Pulled At'),
  { name:'Contacts', kind:'count', via:'People' },
  { name:'Contact Sources', kind:'rollup', via:'People', field:'Contact Source', formula:'ARRAYUNIQUE(values)' },
  { name:'Signals', kind:'mirrorLink', mirror:'Signals' },
  dt('Signal At'), long('ICP Reason'),
  txt('Email'), ...LANE(),
  { name:'Campaigns', kind:'mirrorLink', mirror:'Campaigns' },
  ...MACHINE(), chk('manually_approved')
]};

const PEOPLE={ name:'People', primary:'Name', after:[{table:'Companies'}], fields:[
  txt('Name'), txt('first_name'), txt('last_name'), txt('Title'),
  sel('Seniority',SENIORITY), sel('Department',DEPARTMENT),
  txt('Email'), url('LinkedIn URL'), txt('Phone'), txt('Domain'), txt('Company'),
  { name:'Companies', kind:'link', table:'Companies' },
  txt('Contact Key'), sel('Contact Source',['ContaGen','Supersoniq','AI-Ark']), txt('Source ID'), txt('Tag'),
  formula('Build Date','CREATED_TIME()'),
  ...LANE(),
  chk('manually_approved'),
  formula('relevance',RELEVANCE,['manually_approved']),
  formula('linkedin_name_match',LINKEDIN_NAME_MATCH,['LinkedIn URL','first_name','last_name']),
  { name:'Employees', kind:'lookup', via:'Companies', field:'Employees' },
  { name:'Industry Groups', kind:'lookup', via:'Companies', field:'Industry Groups' },
  { name:'MX Provider', kind:'lookup', via:'Companies', field:'MX Provider' },
  { name:'Country', kind:'lookup', via:'Companies', field:'Country' },
  { name:'State', kind:'lookup', via:'Companies', field:'State' },
  { name:'City', kind:'lookup', via:'Companies', field:'City' },
  { name:'Company Tag', kind:'lookup', via:'Companies', field:'Tag' },
  { name:'Signals', kind:'lookup', via:'Companies', field:'Signals' },
  { name:'Signal At', kind:'lookup', via:'Companies', field:'Signal At' },
  { name:'Campaigns', kind:'mirrorLink', mirror:'Campaigns' },
  ...MACHINE()
]};

const DNC={ name:'DNC', primary:'Domain', after:[{table:'People', field:'Companies'}], fields:[
  txt('Domain'),
  sel('Reason',['Customer','Customer (suspect domain)','Active deal','Partner','Client request','Not interested reply','Staffing / agency']),
  long('Notes'), day('Added'), chk('In PlusVibe Blocklist')
]};

const plain=(T)=>T.fields.filter(f=>f.kind==='plain').map(f=>{ const o={ name:f.name, type:f.type }; if(f.options) o.options=f.options; return o; });
return [{ json: { tables:[COMPANIES, PEOPLE, DNC], seed:{ name:COMPANIES.name, fields:plain(COMPANIES) } } }];
