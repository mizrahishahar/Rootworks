const raw = $input.first().json;
const data = Array.isArray(raw) ? raw[0] : raw;
return [{
  json: {
    Headcount: data?.employees || 'TO CHECK',
    ARR: data?.revenue_range || 'TO CHECK'
  }
}];