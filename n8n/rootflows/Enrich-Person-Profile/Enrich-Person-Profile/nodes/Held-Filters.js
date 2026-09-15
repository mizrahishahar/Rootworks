// Held Filters: the batch's people, one OR formula on RECORD_ID() for the full read of what each
// row already holds (the fill-blanks rule needs every profile value, not the light view read).
const ids=$('Read Records').all().map(i=>String((i.json||{}).id||'')).filter(Boolean);
if(!ids.length) return [{ json:{ formula:"RECORD_ID()=''" } }];
return [{ json:{ formula:'OR('+ids.map(id=>"RECORD_ID()='"+id+"'").join(',')+')' } }];
