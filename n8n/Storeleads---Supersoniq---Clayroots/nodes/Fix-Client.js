const AUTOMAP = {'Waterfall: ContaGen -> Supersoniq':'ContaGen -> Supersoniq','Waterfall: Storeleads -> Supersoniq':'Storeleads -> Supersoniq','Contagen -> Supersoniq -> Clayroots':'ContaGen -> Supersoniq','Storeleads -> Supersoniq -> Clayroots':'Storeleads -> Supersoniq'};
const j = Object.assign({}, $json);
let rec = null;
try { const f = $('Resolve Client').first().json; if (f && f.id) rec = f.id; } catch (e) {}
j['Client'] = rec ? [rec] : [];
if (j['Automation'] && AUTOMAP[j['Automation']]) j['Automation'] = AUTOMAP[j['Automation']];
return [{ json: j }];