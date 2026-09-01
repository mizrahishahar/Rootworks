// Plan Ready: the DNC read sits between Plan Batch and the tiers so both DNC passes share it;
// re-emit the plan as the one item the gates read, so no gate ever evaluates against DNC rows.
return [{ json: $('Plan Batch').first().json }];
