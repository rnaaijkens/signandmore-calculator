// Nederlandse bedragnotatie, gelijk aan euro() in v4 (regel 982):
// een euroteken, een harde spatie, en een komma als decimaalteken.
export function euro(val) { return '€ ' + val.toFixed(2).replace('.', ','); }
