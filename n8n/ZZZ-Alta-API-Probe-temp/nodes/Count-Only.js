const j=$input.first().json||{};
return [{ json: { count:(j.data||[]).length, hasMore:j.hasMore||false, firstId:((j.data||[])[0]||{}).id||'' } }];