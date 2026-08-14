const raw=$input.first().json;
const rec=Array.isArray(raw)?raw[0]:(raw.lead_data?raw:(raw[0]||raw));
const d=(rec&&rec.lead_data)?rec.lead_data:(rec||{});
const si=$('Sub Input').first().json;
return [{ json: {
  lead_email:si.lead_email, campaign_id:si.campaign_id, current_reply:si.current_reply||'', label:si.label||'',
  company_name:d.company_name||'', first_name:d.first_name||'',
  replied_count:Number(d.replied_count||0),
  existing_brief:d.custom_qualification_brief||'',
  custom_qualification_status:d.custom_qualification_status||'', custom_phone:d.custom_phone||'', custom_timezone:d.custom_timezone||''
}}];