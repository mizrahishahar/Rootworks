// Build Registry Row: the Hub Clients write, built from what this run actually produced, sent as
// one Airtable upsert (PATCH with performUpsert) rather than a create, so the row is created or
// filled: a client the Operator already opened a registry row for is filled in place, matched on
// the Client name, and a client with no row yet gets one. That is why the client's name is spelled
// once, on the launch row.
//
// The table ids are RESOLVED, never taken on trust: this node reads the new base's own schema
// (AT Read Final Schema, run after the scaffold) and finds Companies and People by name. A
// duplicated base has fresh table ids every time, so being told them would be a standing lie.
//
// What lands, by Hub field:
//   Client                        fldrPOm3IINTtktbs   the merge key
//   driveMainFolderID             fldSHZVcIgGDmZOpv
//   Slack Channel ID              fldP5V8vAPVHvpuut
//   Clayroots Base ID             fldRAiazbtIutFb7s
//   ClayrootsCompaniesTableID     fldHhhOlD6RSzYi3p
//   ClayrootsPeopleTableID        fldAkkVBD6fLBA9my
//   ClayrootsCompaniesSharedView  fldu7gE5tnsJsS7qc   only when the table description carries it
//   ClayrootsPeopleSharedView     fldVXKc6ToYeWNGEo   only when the table description carries it
//
// The two share links have no creation endpoint anywhere in the Airtable API, so the only way one
// can reach this node is the Operator pasting it into that table's description in the base, the
// convention these two fields replaced. Read from there when it is there; named in the run row's
// checklist when it is not. A value we do not have is OMITTED, never written as an empty string
// over something real: an upsert writes the same keys on create and on update.
const p = $('Launch Params').first().json || {};
const r = $input.first().json || {};
const body = (r.body !== undefined) ? r.body : r;
const tables = (body && Array.isArray(body.tables)) ? body.tables : [];

const ci = (s) => String(s || '').trim().toLowerCase();
const byName = (n) => tables.find(t => ci(t.name) === ci(n));
const shareIn = (t) => {
  const m = String((t && t.description) || '').match(/https:\/\/airtable\.com\/\S+/);
  return m ? m[0].replace(/[)\].,]+$/, '') : '';
};

const companies = byName('Companies');
const people = byName('People');
const missing = [];
if (!tables.length) missing.push('the base schema could not be read at the close, so no table id was resolved');
if (tables.length && !companies) missing.push('no Companies table in ' + p.base);
if (tables.length && !people) missing.push('no People table in ' + p.base);

let folderId = ''; try { folderId = $('Create Client Folder').first().json.id || ''; } catch (e) {}
let channelId = ''; try { channelId = $('Create Slack Channel').first().json.id || ''; } catch (e) {}

const fields = { 'Client': p.clientName, 'Clayroots Base ID': p.base };
if (folderId) fields['driveMainFolderID'] = folderId;
if (channelId) fields['Slack Channel ID'] = channelId;
if (companies) fields['ClayrootsCompaniesTableID'] = companies.id;
if (people) fields['ClayrootsPeopleTableID'] = people.id;
const shareC = companies ? shareIn(companies) : '';
const shareP = people ? shareIn(people) : '';
if (shareC) fields['ClayrootsCompaniesSharedView'] = shareC;
if (shareP) fields['ClayrootsPeopleSharedView'] = shareP;

return [{ json: {
  url: 'https://api.airtable.com/v0/appQG6dK0FIOhTxOl/tblK0nCoNVvFf5SPa',
  body: { performUpsert: { fieldsToMergeOn: ['Client'] }, records: [{ fields: fields }], typecast: true },
  companiesTableId: companies ? companies.id : '',
  peopleTableId: people ? people.id : '',
  sharedCompanies: shareC,
  sharedPeople: shareP,
  written: Object.keys(fields),
  missing: missing,
}, pairedItem: { item: 0 } }];
