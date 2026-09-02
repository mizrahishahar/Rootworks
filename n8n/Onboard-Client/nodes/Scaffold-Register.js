// Scaffold Register: the List Building 2.0 field register (Flowroots/Operations/List Building
// 2.0.md, "Fields"; the laws in Flowroots/Operations/Field Standard.md), the one copy every client
// base is scaffolded from. Pure data, read twice here: Create ClayRoots Base seeds the new base
// with Companies' plain fields (the seed), and Plan Scaffold Pass walks the whole register every
// pass. Every other machine that needs a field definition gets this file inlined at push time by
// the `// @@register` directive in scripts/n8n-push.js (as `const REGISTER`); REGISTER.md at the
// repo root is compiled from it by scripts/register.js. Nothing else defines a field.
// Table descriptions stay empty: the description is reserved for the share link. Views and the
// two synced mirrors ("<Client> Campaigns", "<Client> Signals") are the Operator's manual act,
// never made here.
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
const num=(name,precision)=>({ name, kind:'plain', type:'number', options:{ precision:precision||0 } });
const chk=(name)=>({ name, kind:'plain', type:'checkbox', options:{ color:'greenBright', icon:'check' } });
const url=(name)=>({ name, kind:'plain', type:'url' });
const formula=(name,f,refs)=>({ name, kind:'formula', formula:f, refs:refs||[] });

// Palettes (Field Standard, "Shared vocabularies", ruled 2026-09-02). A choice has one color, the
// same in every base; colors are part of the definition. The four shared palettes:
//   verdict  the email lane (MV, BB, Status) and Campaign Status: green good, yellow risky, red bad,
//            orange error, blue in progress, gray unknown or skipped
//   source   Domain Source and Contact Source: one color per provider, the same everywhere
//   scale    Employees: a ramp, small to large
//   rank     Seniority: by decision power
// Email Source keeps the waterfall's tier colors (TIER). Department and DNC Reason carry their
// own per-choice maps (DEPARTMENT_COLOR: families share a hue; DNC_COLOR).
const VERDICT={ ok:'greenBright', done:'greenBright', deliverable:'greenBright', COMPLETED:'greenBright', catch_all:'yellowBright', risky:'yellowBright', invalid:'redBright', undeliverable:'redBright', no_email_found:'redBright', BOUNCED:'redBright', error:'orangeBright', UNSUBSCRIBED:'orangeBright', verifying:'blueBright', IN_SEQUENCE:'blueBright', REPLIED:'purpleBright', disposable:'orangeLight2', unknown:'grayBright', skipped:'grayLight2', NEVER_CONTACTED:'grayLight2' };
const SOURCE={ DiscoLike:'blueLight2', ContaGen:'blueLight2', Storeleads:'greenLight2', Supersoniq:'purpleLight2', 'AI-Ark':'tealLight2', Signal:'orangeLight2', CSV:'grayLight2' };
const SCALE={ '1-10':'blueLight2', '11-50':'cyanLight2', '51-200':'tealLight2', '201-500':'greenLight2', '501-1000':'yellowLight2', '1001-5000':'orangeLight2', '5001-10000':'redLight2', '10001+':'purpleLight2' };
const RANK={ 'C-Suite':'purpleLight2', Founder:'purpleLight2', Owner:'purpleLight2', President:'purpleLight2', Executive:'purpleLight2', VP:'blueLight2', 'EVP / SVP':'blueLight2', Head:'cyanLight2', Director:'cyanLight2', Manager:'tealLight2', Senior:'greenLight2', Partner:'yellowLight2', 'Board / Chair':'yellowLight2', Unclassified:'grayLight2' };
const TIER={ P0:'blueBright', P1:'cyanBright', P2:'tealBright', P3:'purpleBright', none:'grayBright' };
const DEPARTMENT_COLOR={ Executive:'purpleLight2', Strategy:'purpleLight1', Engineering:'blueLight2', Product:'blueLight1', Technology:'cyanLight2', Data:'cyanLight1', 'R&D':'tealLight2', Security:'tealLight1', Sales:'greenLight2', Marketing:'greenLight1', 'Customer Success':'yellowLight2', Communications:'yellowLight1', Operations:'orangeLight2', 'Project Management':'orangeLight1', Finance:'redLight2', 'Supply Chain':'redLight1', Design:'pinkLight2', 'Human Resources':'pinkLight1', 'Community & Social':'pinkBright', Legal:'grayLight2', 'Compliance & GRC':'grayLight1' };
const DNC_COLOR={ Customer:'greenLight2', 'Customer (suspect domain)':'greenLight1', 'Active deal':'blueLight2', Partner:'purpleLight2', 'Client request':'orangeLight2', 'Not interested reply':'redLight2', 'Staffing / agency':'yellowLight2' };
// paint: names -> choices with their palette color. A value the palette does not name is a register
// defect and fails here, at scaffold time, never as an uncolored choice in a client base.
const paint=(names,palette)=>names.map(n=>{ const color=typeof palette==='string'?palette:palette[n]; if(!color) throw new Error('Scaffold Register: no palette color for "'+n+'"'); return { name:n, color }; });

// The email lane, today's lane verbatim on both tables (the waterfall is untouched). Choices and
// colors exactly as the waterfall has always declared them; Field List in Waterfall Emails and
// Verify Emails now reads them from here. Email itself sits in each table's own order below.
const MV=paint(['ok','catch_all','invalid','disposable','unknown','error','skipped'],VERDICT);
const BB=paint(['verifying','deliverable','undeliverable','risky','unknown','error','skipped'],VERDICT);
const SRC=paint(['P0','P1','P2','P3','none'],TIER);
const ST=paint(['done','verifying','no_email_found','error'],VERDICT);
const LANE=()=>[ sel('MV P0',MV), txt('P1 (Trykitt)'), sel('MV P1',MV), txt('P2 (LeadMagic)'), sel('MV P2',MV), txt('P3 (Prospeo)'), sel('MV P3',MV), sel('BB',BB), txt('Final Email'), sel('Email Source',SRC), sel('Status',ST) ];

// The machine fields the leads sync and the deploy doors write, as Sync PlusVibe Leads declares them.
const CAMPAIGN_STATUS=paint(['NEVER_CONTACTED','IN_SEQUENCE','COMPLETED','REPLIED','BOUNCED','UNSUBSCRIBED'],VERDICT);
const MACHINE=()=>[ num('Messages Sent'), dt('Last Contacted'), sel('Campaign Status',CAMPAIGN_STATUS), txt('Bounce Reason'), dt('Synced At'), txt('Deploy Error') ];

const EMPLOYEES=paint(['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'],SCALE);
const SENIORITY=paint(['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified'],RANK);
// Department: Dave's live list, the register (ruled 2026-09-02); Build People in Waterfall Contacts Batch maps into it.
const DEPARTMENT=paint(['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC'],DEPARTMENT_COLOR);
const DOMAIN_SOURCE=paint(['DiscoLike','Storeleads','Signal','CSV'],SOURCE);
const CONTACT_SOURCE=paint(['ContaGen','Supersoniq','AI-Ark'],SOURCE);
const DNC_REASON=paint(['Customer','Customer (suspect domain)','Active deal','Partner','Client request','Not interested reply','Staffing / agency'],DNC_COLOR);

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
  sel('Domain Source',DOMAIN_SOURCE), txt('Tag'),
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
  txt('Contact Key'), sel('Contact Source',CONTACT_SOURCE), txt('Source ID'), txt('Tag'),
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
  sel('Reason',DNC_REASON),
  long('Notes'), day('Added'), chk('In PlusVibe Blocklist')
]};

// Declared extras (Field Standard, "Declared extras"): named groups on Companies the scaffold
// creates when the launch row picks the group; each owner machine writes only its own group and
// creates nothing. Types exactly as the page's table. Trustpilot Rating is shared by Storeleads
// and Reviews under the same name and type.
const EXTRAS=[
  { group:'Storeleads', owner:'Insert Storeleads domains to Clayroots', table:'Companies', fields:[
    txt('Plan'), num('Revenue Est Monthly'), num('Store Age Years',1), num('Product Count'), num('App Spend Mo'),
    txt('Key Apps'), txt('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews'),
    txt('Migrated From'), txt('Social Followers'), txt('Growth 90d'), txt('Features')
  ]},
  { group:'Hiring', owner:'Handle Hiring Intent Signal', table:'Companies', fields:[
    txt('Job ID'), txt('Job Title'), url('Job Link'), day('Job Posted'), long('Job Description'),
    txt('Job Seniority'), txt('Job Function'), txt('Job Employment Type'), txt('Job Industries'),
    num('Job Applicants'), txt('Job Salary'), txt('Job Poster Name'), txt('Job Poster Title'),
    url('Job Poster LinkedIn'), num('Existing In Role')
  ]},
  { group:'Reviews', owner:'Handle Service Reviews Intent Signal', table:'Companies', fields:[
    num('Review Count'), day('Review Latest'), url('Review Link'), long('Review Titles'), long('Review Quotes'),
    txt('Review Replied'), num('Trustpilot Rating',1), num('Trustpilot Reviews Total'), url('Trustpilot URL')
  ]}
];

const plain=(T)=>T.fields.filter(f=>f.kind==='plain').map(f=>{ const o={ name:f.name, type:f.type }; if(f.options) o.options=f.options; return o; });
return [{ json: { tables:[COMPANIES, PEOPLE, DNC], extras:EXTRAS, palettes:{ verdict:VERDICT, source:SOURCE, scale:SCALE, rank:RANK, tier:TIER, department:DEPARTMENT_COLOR, dncReason:DNC_COLOR }, seed:{ name:COMPANIES.name, fields:plain(COMPANIES) } } }];
