const g=$('Guard Source Schema').first().json;
const sd=$getWorkflowStaticData('global');
delete sd.hebSeed;
sd.hebSeed={ tuples:[], pages:0, scanned:0 };
const F=['first_name','last_name','hebrew_speaker','first_name_he','Country','Domain'];
const qsBase='pageSize=100&'+F.map(function(n){ return 'fields%5B%5D='+encodeURIComponent(n); }).join('&');
return [{ json: { baseId:g.baseId, tableId:g.tableId, qsBase:qsBase, qs:qsBase, pages:0, scanned:0, hasMore:true, capHit:false } }];