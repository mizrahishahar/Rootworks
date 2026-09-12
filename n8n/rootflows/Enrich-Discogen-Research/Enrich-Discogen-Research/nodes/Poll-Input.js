// Poll Input: the carriers of every open task, re-emitted each round so DG Poll asks once per task
// and Poll Gate folds by index. First round from Init Tasks, later rounds from the Wait.
const items=$input.all().map(i=>i.json||{}).filter(j=>!j._none);
if(!items.length) return [{ json:{ _none:true } }];
return items.map(j=>({ json:j }));
