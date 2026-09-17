// Poll Input: the carrier of the open enrichment, re-emitted each round so FE Poll asks once and
// Poll Gate folds the answer onto it. First round from Submit Check, later rounds from the Wait.
const c=Object.assign({}, $input.first().json||{});
delete c.found;
return [{ json:c }];
