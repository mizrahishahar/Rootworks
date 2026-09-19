// Alta Token Gate: the refreshed access token, or a refusal. Same shape the campaign sync uses:
// the refresh token lives in the alta_oauth data table, the access token is minted per run and
// never leaves n8n. A dead refresh token means the Operator re-authorizes through Alta OAuth Callback.
const t = $input.first().json || {};
const prev = $('Alta Get Token').first().json || {};
const req = $('Parse Request').first().json || {};
const access = t.access_token || '';
if (!access) return [{ json: Object.assign({}, req, { _ok: false, _code: 502, ok: false, error: 'Alta OAuth refresh failed; the door cannot reach Alta until the refresh token is renewed', detail: JSON.stringify(t).slice(0, 300) }) }];
return [{ json: Object.assign({}, req, { _ok: true, access_token: access, refresh_token: t.refresh_token || prev.refresh_token || '', expires_at: new Date(Date.now() + ((t.expires_in || 86400) * 1000)).toISOString() }) }];
