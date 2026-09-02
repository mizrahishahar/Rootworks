// Plan Lookups: pairs each Companies create response with the column Plan Columns queued (same
// order, one response per call) and plans the same-named lookup on People through the Companies
// link, with the new column's field id. A Companies create that came back without an id stops
// the run here, by name, before any row is written.
const c=$('Check Columns').first().json;
const planned=$('Plan Columns').all().map(i=>i.json);
const items=$input.all();
const url='https://api.airtable.com/v0/meta/bases/'+c.base+'/tables/'+c.peopleTableId+'/fields';
const out=[]; const failed=[];
items.forEach((it,i)=>{
  const p=planned[i]; const name=p?p.name:('column '+i);
  const j=it.json||{}; const b=(j.body!==undefined)?j.body:j;
  if(b&&b.id){ out.push({ json: { name: name, url: url, body: { name: name, type: 'multipleLookupValues', options: { recordLinkFieldId: c.peopleLinkId, fieldIdInLinkedTable: b.id } } } }); return; }
  let err='no id in the response';
  if(b&&b.error) err=(typeof b.error==='string')?b.error:(b.error.message||b.error.type||JSON.stringify(b.error));
  else if(j.error) err=String(j.error.message||j.error);
  failed.push(name+': '+String(err).slice(0,160));
});
if(items.length!==planned.length) failed.push(planned.length+' columns planned, '+items.length+' responses came back');
if(failed.length){ throw new Error('Insert domains to Clayroots could not create on Companies: '+failed.join('; ')+'. Nothing was written.'); }
return out;
