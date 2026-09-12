// One input shape from either door: the MCP tool call (workflow inputs) or GET /webhook/availability?client=&timezone=&days=&max=
const j=$input.first().json||{};
const q=(j.query&&typeof j.query==='object')?j.query:{};
const pick=(k,d)=>{ const v=(j[k]!==undefined&&j[k]!==null&&j[k]!=='')?j[k]:q[k]; return (v===undefined||v===null||v==='')?d:v; };
const client=String(pick('client','')).trim();
if(!client) throw new Error('client is required: the client name as it appears in the Hub registry (e.g. Adelante)');
return [{ json: {
  client,
  clientSlug: client.toLowerCase().replace(/[^a-z0-9]/g,''),
  timezone: String(pick('timezone','Asia/Jerusalem')).trim(),
  days: Math.max(1, Math.min(28, parseInt(pick('days',7),10)||7)),
  max: Math.max(1, Math.min(30, parseInt(pick('max',8),10)||8)),
} }];
