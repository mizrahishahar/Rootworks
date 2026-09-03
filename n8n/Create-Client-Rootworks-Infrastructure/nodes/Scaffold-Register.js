// Scaffold Register: the List Building 2.0 field register (Flowroots/Operations/List Building
// 2.0.md, "Fields"; the laws in Flowroots/Operations/Field Standard.md), the one copy every client
// base is scaffolded from. Pure data, read twice here: Create ClayRoots Base seeds the new base
// with Companies' plain fields (the seed), and Plan Scaffold Pass walks the whole register every
// pass. Every other machine that needs a field definition gets this file inlined at push time by
// the `// @@register` directive in scripts/n8n-push.js (as `const REGISTER`); REGISTER.md at the
// repo root is compiled from it by scripts/register.js. Nothing else defines a field.
// Table descriptions stay empty: the description is reserved for the share link. The views are
// declared here as data (name, filter, fields, sort) so the register is their spec too; making
// them in a base, like the two synced mirrors ("<Client> Campaigns", "<Client> Signals"), is the
// Operator's manual act, never made here.
// The Hub side (ruled 2026-09-02). Clients carries the only per-client table pointers:
// ClayrootsCompaniesTableID, ClayrootsPeopleTableID, ClayrootsCompaniesSharedView,
// ClayrootsPeopleSharedView. A machine that takes Table takes it by name (People or Companies) and
// resolves it in the client's base; a machine that needs an id reads those four. Signals.View is the
// Airtable view id of the queue view the signal feeds, on the table named by Campaigns.Table
// (People for a lead feed, Companies for a company feed). No other Hub field points at a client
// table or view.
//
// Field kinds. plain: type + options, created with its table or as a column. formula: refs are
// field names on the same table, swapped for field ids at plan time. link: to a register table.
// mirrorLink: to the client's synced mirror when the base carries it, else a counted skip.
// lookup / count / rollup: through a link, resolved by the linked table's id, never by name.
// mirrorLookup: a lookup through a mirrorLink instead of through the Companies link. It resolves
// by the mirror's own table (whose name carries the client's name), so it names `mirror`, the way
// mirrorLink does, and never `via`, the way every Companies lookup does. Same skip rule as
// mirrorLink: no mirror in the base, no field.
const SEL=(choices)=>({ choices: choices.map(c=>typeof c==='string'?{name:c}:c) });
const txt=(name)=>({ name, kind:'plain', type:'singleLineText' });
const long=(name)=>({ name, kind:'plain', type:'multilineText' });
const sel=(name,choices)=>({ name, kind:'plain', type:'singleSelect', options:SEL(choices) });
const dt=(name)=>({ name, kind:'plain', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } });
const day=(name)=>({ name, kind:'plain', type:'date', options:{ dateFormat:{name:'iso'} } });
const num=(name,precision)=>({ name, kind:'plain', type:'number', options:{ precision:precision||0 } });
const chk=(name)=>({ name, kind:'plain', type:'checkbox', options:{ color:'greenBright', icon:'check' } });
const url=(name)=>({ name, kind:'plain', type:'url' });
const formula=(name,f,refs,description)=>({ name, kind:'formula', formula:f, refs:refs||[], description });
const lookup=(name)=>({ name, kind:'lookup', via:'Companies', field:name });
const mirrorLookup=(name,mirror,field,description)=>({ name, kind:'mirrorLookup', mirror, field, description });
// Sequencers, the one mirror-derived lookup, on both Companies and People through their own
// Campaigns link. It names which senders already hold this row. Plural on purpose: a row can link
// several campaigns, so the value is a list ("PlusVibe, PlusVibe" or "Alta, PlusVibe"), and the
// name says so at a glance. The mirror's own column stays `Sequencer`, singular, because one
// campaign really does have one sender. A live view tests this list with does-not-contain, never
// equals: a campaign-feeding view excludes only its own sender, because a person already in an
// Alta campaign is still a legitimate target for a PlusVibe one, and the reverse.
const SEQUENCERS=()=>mirrorLookup('Sequencers','Campaigns','Sequencer',
  'The senders that already hold this row, one per linked campaign. A campaign-feeding view excludes only its own sender with a does-not-contain test, so the same person can legitimately sit in campaigns on two different senders.');
// about: a Companies field that describes the company. The On People rule (ruled 2026-09-02):
// every such field is on People as a lookup of the identical name, generated below from this flag,
// never typed by hand. A Companies field without the flag stays off People.
const about=(f)=>Object.assign(f,{ company:true });

// Palettes (Field Standard, "Shared vocabularies", ruled 2026-09-02). A choice has one color, the
// same in every base; colors are part of the definition. The four shared palettes:
//   verdict  the email lane (MV, BB, Status) and Campaign Status: green good, yellow risky, red bad,
//            orange error, blue in progress, gray unknown or skipped
//   source   Contact Source: one color per provider, the same everywhere
//   scale    Employees: a ramp, small to large
//   rank     Seniority: by decision power
// Email Source keeps the waterfall's tier colors (TIER). Department and DNC Reason carry their
// own per-choice maps (DEPARTMENT_COLOR: families share a hue; DNC_COLOR).
const VERDICT={ ok:'greenBright', done:'greenBright', deliverable:'greenBright', COMPLETED:'greenBright', catch_all:'yellowBright', risky:'yellowBright', invalid:'redBright', undeliverable:'redBright', no_email_found:'redBright', BOUNCED:'redBright', error:'orangeBright', UNSUBSCRIBED:'orangeBright', verifying:'blueBright', IN_SEQUENCE:'blueBright', REPLIED:'purpleBright', disposable:'orangeLight2', unknown:'grayBright', skipped:'grayLight2', NEVER_CONTACTED:'grayLight2' };
const SOURCE={ ContaGen:'blueLight2', Supersoniq:'purpleLight2', 'AI-Ark':'tealLight2' };
const SCALE={ '1-10':'blueLight2', '11-50':'cyanLight2', '51-200':'tealLight2', '201-500':'greenLight2', '501-1000':'yellowLight2', '1001-5000':'orangeLight2', '5001-10000':'redLight2', '10001+':'purpleLight2' };
const RANK={ 'C-Suite':'purpleLight2', Founder:'purpleLight2', Owner:'purpleLight2', President:'purpleLight2', Executive:'purpleLight2', VP:'blueLight2', 'EVP / SVP':'blueLight2', Head:'cyanLight2', Director:'cyanLight2', Manager:'tealLight2', Senior:'greenLight2', Partner:'yellowLight2', 'Board / Chair':'yellowLight2', Unclassified:'grayLight2' };
const TIER={ P0:'blueBright', P1:'cyanBright', P2:'tealBright', P3:'purpleBright', none:'grayBright' };
const DEPARTMENT_COLOR={ Executive:'purpleLight2', Strategy:'purpleLight1', Engineering:'blueLight2', Product:'blueLight1', Technology:'cyanLight2', Data:'cyanLight1', 'R&D':'tealLight2', Security:'tealLight1', Sales:'greenLight2', Marketing:'greenLight1', 'Customer Success':'yellowLight2', Communications:'yellowLight1', Operations:'orangeLight2', 'Project Management':'orangeLight1', Finance:'redLight2', 'Supply Chain':'redLight1', Design:'pinkLight2', 'Human Resources':'pinkLight1', 'Community & Social':'pinkBright', Legal:'grayLight2', 'Compliance & GRC':'grayLight1' };
const DNC_COLOR={ Customer:'greenLight2', 'Not interested':'redLight2', 'Client request':'orangeLight2', 'Active deal':'blueLight2' };
// paint: names -> choices with their palette color. A value the palette does not name is a register
// defect and fails here, at scaffold time, never as an uncolored choice in a client base.
const paint=(names,palette)=>names.map(n=>{ const color=typeof palette==='string'?palette:palette[n]; if(!color) throw new Error('Scaffold Register: no palette color for "'+n+'"'); return { name:n, color }; });

// The email lane. Choices and colors exactly as the waterfall has always declared them; Field List
// in Waterfall Emails and Verify Emails reads them from here. People carries the whole lane
// (LANE, Email in its own place in the table's order); Companies carries the short lane
// (COMPANY_LANE, ruled 2026-09-02): Email, MV P0, BB, Final Email, Status, the same choices and colors.
const MV=paint(['ok','catch_all','invalid','disposable','unknown','error','skipped'],VERDICT);
const BB=paint(['verifying','deliverable','undeliverable','risky','unknown','error','skipped'],VERDICT);
const SRC=paint(['P0','P1','P2','P3','none'],TIER);
const ST=paint(['done','verifying','no_email_found','error'],VERDICT);
const LANE=()=>[ sel('MV P0',MV), txt('P1 (Trykitt)'), sel('MV P1',MV), txt('P2 (LeadMagic)'), sel('MV P2',MV), txt('P3 (Prospeo)'), sel('MV P3',MV), sel('BB',BB), txt('Final Email'), sel('Email Source',SRC), sel('Status',ST) ];
const COMPANY_LANE=()=>[ txt('Email'), sel('MV P0',MV), sel('BB',BB), txt('Final Email'), sel('Status',ST) ];

// The machine fields the leads sync and the deploy doors write, as Sync PlusVibe Leads declares them.
const CAMPAIGN_STATUS=paint(['NEVER_CONTACTED','IN_SEQUENCE','COMPLETED','REPLIED','BOUNCED','UNSUBSCRIBED'],VERDICT);
const MACHINE=()=>[ num('Messages Sent'), dt('Last Contacted'), sel('Campaign Status',CAMPAIGN_STATUS), txt('Bounce Reason'), dt('Synced At'), txt('Deploy Error') ];

const EMPLOYEES=paint(['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'],SCALE);
const SENIORITY=paint(['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified'],RANK);
// Department: Dave's live list, the register (ruled 2026-09-02); Build People in Waterfall Contacts Batch maps into it.
const DEPARTMENT=paint(['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC'],DEPARTMENT_COLOR);
const CONTACT_SOURCE=paint(['ContaGen','Supersoniq','AI-Ark'],SOURCE);
const DNC_REASON=paint(['Customer','Not interested','Client request','Active deal'],DNC_COLOR);

// relevance: the placeholder the Operator replaces per client with the client's buyer rule.
// manually_approved always passes; the rule is the rest of the OR. The description below is the
// one place this reaches a reader who never opens this file: it renders into REGISTER.md and,
// once a base is scaffolded, into the field itself in Airtable, so it has to say the same thing
// there that this comment says here.
const COMPANY_RELEVANCE='IF(OR({manually_approved}, {public_emails_clean} != ""), 1, 0)';
const COMPANY_RELEVANCE_DESCRIPTION='Placeholder: every client must replace this with their own buyer rule. As shipped it passes manually_approved rows plus any row carrying a public email (public_emails_clean not blank). Until the client\'s rule replaces it, relevance-filtered views on this table (Not Waterfalled, Not Found, Found, Found : Campaigns) show only rows that happen to clear that default, not a configured buyer rule.';
const PEOPLE_RELEVANCE='IF(OR({manually_approved}, FALSE()), 1, 0)';
const PEOPLE_RELEVANCE_DESCRIPTION='Placeholder: every client must replace this with their own buyer rule. As shipped the OR\'s second half is always FALSE, so nothing passes except rows ticked manually_approved by hand. Until the client\'s rule replaces it, every relevance-filtered view on this table (Relevant, Not Waterfalled, Not Found, Found, Found : Campaigns, Found : Never Contacted, Signals) stays empty.';
// linkedin_name_match: 1 when the LinkedIn URL slug (after /in/, letters only) contains the
// cleaned first or last name (letters only), else 0. Blank name or blank URL is 0.
const SLUG='REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")';
const NAME=(f)=>'REGEX_REPLACE(LOWER({'+f+'}), "[^a-z]", "")';
const HIT=(f)=>'AND(LEN('+NAME(f)+') > 0, FIND('+NAME(f)+', '+SLUG+') > 0)';
const LINKEDIN_NAME_MATCH='IF(AND({LinkedIn URL}, OR({first_name}, {last_name})), IF(OR('+HIT('first_name')+', '+HIT('last_name')+'), 1, 0), 0)';

// Views (ruled 2026-09-02): name, filter (in words and as an Airtable formula), the visible fields
// in order, sort. Build Date descending everywhere it exists; DNC has no Build Date and sorts by Added.
// The standard set below is a reporting set: every one of them describes a state of the table, and
// "Found : Campaigns" and "Found : Never Contacted" are read, not fed from. "Never Contacted" reads
// Messages Sent = 0, which is a fact about the row, not an exclusion rule.
// A campaign-feeding view is the Operator's, made per campaign on top of these, and it excludes per
// sender, never blanket (ruled 2026-09-03). Being in some other campaign is not a reason to skip a
// person: someone already enrolled on Alta is still a legitimate target on PlusVibe, and the
// reverse. The exclusion filter is Sequencers does-not-contain the campaign's own sender, and only
// that. Sequencers is a list (a row can link several campaigns), so it is never tested with equals,
// and a Campaigns-is-empty filter is wrong wherever it appears.
// Numeric fields a machine writes (Messages Sent, and anything shaped like it) carry a trap: an
// Airtable formula treats a blank number as 0, so a formula filter written as "field = 0" is
// correct as intent and needs no change there. Airtable's own filter-builder interface does not:
// a condition of "field = 0" matches only a literal zero and skips every blank, so a view built
// from the words alone, by hand in that interface, matches nothing where the field was never
// written. Any view filtering on a numeric field a machine writes must add the empty case by hand:
// field = 0 OR field is empty. This does not apply to computed count fields such as Contacts
// Count: a count always returns a number and is never blank, which is why "Not Covered" (Contacts
// Count = 0) is unaffected.
// A grid view's primary field (Name on People, Domain on Companies) is always visible in Airtable
// and cannot be hidden from a grid view, so a view's `fields` list below is the rest of the visible
// columns, not the complete set; the primary field being absent from a list here is not drift.
const view=(name,words,f,fields,sortField)=>({ name, filter:{ words, formula:f }, fields, sort:{ field:sortField||'Build Date', direction:'desc' } });
const RELEVANT='{relevance} = 1';
const NOT_WATERFALLED='AND({relevance} = 1, NOT({Status}))';
const NOT_FOUND='AND({relevance} = 1, OR({Status} = "no_email_found", {Status} = "error"))';
const FOUND='AND({relevance} = 1, {Status} = "done")';
const SIGNALS='AND({relevance} = 1, {Signals} != BLANK())';

const COMPANY_COVERAGE=['Domain','Company','Description','Employees','Tag','Contacts Count','Contact Sources','Contacts Pulled At','Build Date'];
const COMPANY_EMAILS=['Domain','Company','Description','Tag','public_emails_clean','Email','MV P0','BB','Final Email','Status','Build Date'];
const COMPANIES={ name:'Companies', primary:'Domain', fields:[
  ...[ txt('Domain'), txt('Company'), long('Description'), txt('Industry Groups'), txt('Business Model'),
    sel('Employees',EMPLOYEES), txt('Revenue Range'), txt('Keywords'),
    txt('Country'), txt('State'), txt('City'), txt('Street'), txt('Zip'),
    txt('Phones'), txt('Public Emails'), txt('Social URLs'), txt('public_emails_clean'),
    txt('MX Provider'), txt('Redirect Domain'),
    txt('Domain Source'), txt('Tag') ].map(about),
  formula('Build Date','CREATED_TIME()'),
  dt('Contacts Pulled At'),
  { name:'Contacts Count', kind:'count', via:'People' },
  { name:'Contact Sources', kind:'rollup', via:'People', field:'Contact Source', formula:'ARRAYUNIQUE(values)' },
  about({ name:'Signals', kind:'mirrorLink', mirror:'Signals' }),
  about(dt('Signal At')), about(long('ICP Reason')),
  ...COMPANY_LANE(),
  { name:'Campaigns', kind:'mirrorLink', mirror:'Campaigns' }, SEQUENCERS(),
  ...MACHINE(), chk('manually_approved'),
  formula('relevance',COMPANY_RELEVANCE,['manually_approved','public_emails_clean'],COMPANY_RELEVANCE_DESCRIPTION)
], views:[
  view('Not Sourced','Contacts Pulled At is empty','NOT({Contacts Pulled At})',COMPANY_COVERAGE),
  view('Not Covered','Contacts Pulled At is set and Contacts Count = 0','AND({Contacts Pulled At}, {Contacts Count} = 0)',COMPANY_COVERAGE),
  view('Covered','Contacts Count > 0','{Contacts Count} > 0',COMPANY_COVERAGE),
  view('Cut Review','relevance = 0','{relevance} = 0',['Domain','Company','Description','Employees','Tag','manually_approved','Build Date']),
  view('Not Waterfalled','relevance = 1 and Status is empty',NOT_WATERFALLED,COMPANY_EMAILS),
  view('Not Found','relevance = 1 and Status is no_email_found or error',NOT_FOUND,COMPANY_EMAILS),
  view('Found','relevance = 1 and Status = done',FOUND,COMPANY_EMAILS),
  view('Found : Campaigns','relevance = 1 and Status = done',FOUND,['Domain','Company','Description','Final Email','Tag','Campaigns','Campaign Status','Messages Sent','Last Contacted','Build Date'])
]};

// The On People rule, as code: every Companies field flagged `company` lands on People as a lookup
// of the identical name, in Companies' order.
const COMPANY_LOOKUPS=()=>COMPANIES.fields.filter(f=>f.company).map(f=>lookup(f.name));
const PEOPLE_EMAILS=['Name','Title','Company','Tag','Email','MV P0','P1 (Trykitt)','MV P1','P2 (LeadMagic)','MV P2','P3 (Prospeo)','MV P3','BB','Final Email','Email Source','Status','Build Date'];
const PEOPLE_CAMPAIGNS=['first_name','last_name','Title','Company','Description','Domain','Final Email','LinkedIn URL','Tag','Campaigns','Campaign Status','Messages Sent','Last Contacted','Build Date'];
// Signals, the signal queue (ruled 2026-09-03): the people whose company carries a signal, freshest
// signal on top. It reads the Relevant set plus the two signal fields, and it is the view a signal
// play is worked from.
// It CANNOT exist until the client's synced Signals mirror is in the base. The filter tests
// {Signals}, a lookup through the Companies link to Companies.Signals, and that is a mirrorLink: no
// mirror in the base, no field, so no view. Same rule as Sequencers and the Campaigns link. A
// freshly duplicated template base cannot carry this view; it belongs on the post-duplication
// checklist, beside the mirrors themselves, never in the template.
// Signal-play extras stay out of the list below. A client running the Hiring play also shows that
// group's Job Title, Job Posted and Existing In Role, which exist only when the group is picked; a
// client's own per-contact columns are the Operator's. Both are added on top, per client.
const PEOPLE_SIGNALS=['Name','Title','Seniority','Department','Company','Description','Employees','Email','LinkedIn URL','Contact Source','Tag','Signals','Signal At','Build Date'];
const PEOPLE={ name:'People', primary:'Name', after:[{table:'Companies'}], fields:[
  txt('Name'), txt('first_name'), txt('last_name'), txt('Title'),
  sel('Seniority',SENIORITY), sel('Department',DEPARTMENT),
  txt('Email'), url('LinkedIn URL'), txt('Phone'),
  { name:'Companies', kind:'link', table:'Companies' },
  txt('Contact Key'), sel('Contact Source',CONTACT_SOURCE), txt('Source ID'),
  formula('Build Date','CREATED_TIME()'),
  ...LANE(),
  chk('manually_approved'),
  formula('relevance',PEOPLE_RELEVANCE,['manually_approved'],PEOPLE_RELEVANCE_DESCRIPTION),
  formula('linkedin_name_match',LINKEDIN_NAME_MATCH,['LinkedIn URL','first_name','last_name']),
  ...COMPANY_LOOKUPS(),
  { name:'Campaigns', kind:'mirrorLink', mirror:'Campaigns' }, SEQUENCERS(),
  ...MACHINE()
], views:[
  view('Relevant','relevance = 1',RELEVANT,['Name','Title','Seniority','Department','Company','Description','Employees','Email','LinkedIn URL','Contact Source','Tag','Build Date']),
  view('Cut Review','relevance = 0','{relevance} = 0',['Name','Title','Seniority','Department','Company','Description','Employees','Tag','manually_approved','Build Date']),
  view('Not Waterfalled','relevance = 1 and Status is empty',NOT_WATERFALLED,PEOPLE_EMAILS),
  view('Not Found','relevance = 1 and Status is no_email_found or error',NOT_FOUND,PEOPLE_EMAILS),
  view('Found','relevance = 1 and Status = done',FOUND,PEOPLE_EMAILS),
  view('Found : Campaigns','relevance = 1 and Status = done',FOUND,PEOPLE_CAMPAIGNS),
  view('Found : Never Contacted','relevance = 1 and Status = done and (Messages Sent = 0 or Messages Sent is empty). Build the OR group by hand: the filter interface does not treat a blank Messages Sent as 0 the way the formula below does.','AND({relevance} = 1, {Status} = "done", {Messages Sent} = 0)',PEOPLE_CAMPAIGNS),
  view('Signals','relevance = 1 and Signals is not empty. Needs the synced Signals mirror: the filter reads a lookup of Companies.Signals, a mirrorLink, so a base without the mirror cannot carry this view',SIGNALS,PEOPLE_SIGNALS,'Signal At')
]};

const DNC={ name:'DNC', primary:'Domain', after:[{table:'People', field:'Companies'}], fields:[
  txt('Domain'),
  sel('Reason',DNC_REASON),
  long('Notes'), day('Added')
], views:[
  view('Not Interested','Reason = Not interested','{Reason} = "Not interested"',['Domain','Reason','Notes','Added'],'Added'),
  view('From Client','Reason is not Not interested','{Reason} != "Not interested"',['Domain','Reason','Notes','Added'],'Added')
]};

// Declared extras (Field Standard, "Declared extras"): named groups on Companies the scaffold
// creates when the launch row picks the group; each owner machine writes only its own group and
// creates nothing. Types exactly as the page's table. Trustpilot Rating is shared by Storeleads
// and Reviews under the same name and type. Every extras field describes the company, so the On
// People rule applies: each group also brings its fields to People as lookups of the identical
// name, generated here from the Companies group, created with it when the group is picked.
const COMPANY_EXTRAS=[
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
const EXTRAS=[ ...COMPANY_EXTRAS, ...COMPANY_EXTRAS.map(g=>({ group:g.group, owner:g.owner, table:'People', fields:g.fields.map(f=>lookup(f.name)) })) ];

// Guards: a duplicate name on a table, or a view naming a field the table does not carry, is a
// register defect and fails here, never as a half-made base.
const refs=(f)=>(String(f).match(/\{([^}]+)\}/g)||[]).map(s=>s.slice(1,-1));
for(const T of [COMPANIES,PEOPLE,DNC]){
  const have=new Set(T.fields.map(f=>f.name));
  if(have.size!==T.fields.length) throw new Error('Scaffold Register: duplicate field name on '+T.name);
  for(const v of T.views||[]) for(const n of [...v.fields, v.sort.field, ...refs(v.filter.formula)]) if(!have.has(n)) throw new Error('Scaffold Register: view "'+v.name+'" on '+T.name+' names "'+n+'", which the table does not carry');
}

const plain=(T)=>T.fields.filter(f=>f.kind==='plain').map(f=>{ const o={ name:f.name, type:f.type }; if(f.options) o.options=f.options; return o; });
return [{ json: { tables:[COMPANIES, PEOPLE, DNC], extras:EXTRAS, palettes:{ verdict:VERDICT, source:SOURCE, scale:SCALE, rank:RANK, tier:TIER, department:DEPARTMENT_COLOR, dncReason:DNC_COLOR }, seed:{ name:COMPANIES.name, fields:plain(COMPANIES) } } }];
