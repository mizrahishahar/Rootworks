const tables=['B2B','Xpand','Cali'];
function isReady(f){const s=String(f.Status||'').toLowerCase();const fe=String(f['Final Email']||'').trim();return s.includes('done')&&fe!=='';}
const ceo=/\bceo\b|chief exec|founder|co-?found|owner|\bpresident\b/;
const cto=/\bcto\b|chief tech/;
const chief=/\bchief\b|\bcoo\b|\bcfo\b|\bcmo\b|\bcpo\b|\bcro\b|\bciso\b|\bcio\b/;
const eng=/engineer|devops|infrastructure|platform|architect|technolog/;
const midlead=/\bvp\b|vice president|\bhead\b|director|\bvice\b|\bavp\b|\bsvp\b/;
function inc(o,k){o[k]=(o[k]||0)+1;}
const titles={};const leakCEOrank={};let other=0,leakCEO=0,leakCTO=0,chiefN=0,engN=0,midN=0,blank=0,none=0;
for(const key of tables){let items=[];try{items=$(key).all();}catch(e){}
 for(const it of items){const f=it.json.fields||it.json;if(!isReady(f))continue;const seg=String(f['Campaign Segment']||'');if(seg!=='Other')continue;other++;const t=String(f.Title||'').toLowerCase().trim();
  if(t==='')blank++;else if(ceo.test(t)){leakCEO++;inc(leakCEOrank,String(f['Seniority Rank']));}else if(cto.test(t))leakCTO++;else if(chief.test(t))chiefN++;else if(eng.test(t))engN++;else if(midlead.test(t))midN++;else none++;
  inc(titles,String(f.Title||'(blank)').trim()||'(blank)');
 }
}
const topTitles=Object.entries(titles).sort((a,b)=>b[1]-a[1]).slice(0,30).map(function(e){return e[0]+': '+e[1];});
return[{json:{other_total:other,leaked_CEOfounder:leakCEO,leaked_CEO_by_rank:leakCEOrank,leaked_CTO:leakCTO,other_cxo:chiefN,eng_titles_in_other:engN,other_midlevel_nontech:midN,blank_title:blank,unclassified:none,top30_other_titles:topTitles}}];