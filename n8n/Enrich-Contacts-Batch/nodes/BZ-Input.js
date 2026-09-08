// Provider Input: the one item every provider sub-workflow receives, the plan's companies (domain,
// cap, floor) and nothing else. Re-emitted before each Run node because Execute Workflow passes
// its own input through, and the previous provider's answer must never be the next one's input.
const plan=$('Plan Ready').first().json||{};
return [{ json:{ companies:plan.companies||[], batchNum:plan.batchNum||0 } }];
