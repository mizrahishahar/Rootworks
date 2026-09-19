// Gate for the "still worth a call" nudge: only when the prospect has a phone on file, a BDR-channel
// thread to reply into, and the client has a BDR Slack channel. Fixed text, one message, never more.
let rp={}; try{ rp=$('Read Changed Prospect').first().json||{}; }catch(e){}
let c=null; try{ c=$('Get Changed Client').first().json; }catch(e){}
const cf=(c&&(c.fields||c))||{};
const channel=String(cf['BDR Slack Channel ID']||'').trim();
const post=!!(rp.phone && rp.threadTs && channel);
return [{ json:{ post, channel, threadTs:rp.threadTs||'', text:'Their meeting was cancelled. Still worth a call.' } }];
