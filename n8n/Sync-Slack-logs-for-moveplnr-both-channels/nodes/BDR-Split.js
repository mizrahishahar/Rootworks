const msgs=($json.messages)||[];
return msgs.map(m=>({ json: { ts:m.ts } }));