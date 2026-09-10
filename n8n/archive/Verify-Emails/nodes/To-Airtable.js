const STRIP=['_pendEmail','_pendSlot','_mv','_mvCol','_wasDone','_preserved','_blanked'];
return $input.all().map(i=>{ const j={...i.json}; for(const k of STRIP) delete j[k]; return {json:j}; });