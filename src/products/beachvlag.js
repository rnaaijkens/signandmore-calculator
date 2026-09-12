import { v, clearResult } from '../dom.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceBeachvlag, BV_SIZES } from '../pricing/beachvlag.js';

// Vult de afmeting-select opnieuw bij een ander type en houdt de huidige keuze
// aan als die ook in de nieuwe lijst voorkomt — v4 regels 1219-1227.
export function bvUpdateSizes() {
  const type = v('bv-type');
  const sel  = document.getElementById('bv-afmeting');
  const cur  = sel.value;
  sel.innerHTML = BV_SIZES[type].map(s =>
    '<option value="' + s + '"' + (s === cur ? ' selected' : '') + '>' + s + ' cm</option>'
  ).join('');
  calcBeachvlag();
}

export function calcBeachvlag() {
  const type    = v('bv-type');
  const afm     = v('bv-afmeting');
  const metMast = parseInt(v('bv-mast'));
  const aantal  = parseInt(document.getElementById('bv-aantal').value) || 1;
  if (!afm) { clearResult('bv-result'); return; }

  const { flagPrijs, mastPrijs, total } =
    priceBeachvlag({ type, afmeting: afm, metMast, aantal }, getPrices());

  const breakdown = [
    { label: type.charAt(0).toUpperCase() + type.slice(1) + 'flag ' + afm + ' cm — ' + aantal + '×', val: flagPrijs * aantal },
  ];
  if (metMast) breakdown.push({ label: 'Mast — ' + aantal + '×', val: mastPrijs * aantal });

  renderResult('bv-result', breakdown, total, aantal + ' vlag(gen) — ' + type + ' ' + afm + ' cm');
}
