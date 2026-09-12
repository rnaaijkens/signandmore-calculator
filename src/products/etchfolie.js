import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceEtchfolie } from '../pricing/etchfolie.js';

export function calcEtchfolie() {
  const b = n('ef-breedte'), h = n('ef-hoogte');
  if (!b || !h) { clearResult('ef-result'); return; }

  const lvt = v('ef-levertijd');

  const { opp, prijs, total } =
    priceEtchfolie({ breedte: b, hoogte: h, levertijd: lvt }, getPrices());

  renderResult('ef-result', [
    { label: 'Etchfolie ' + lvt + ' wkd — ' + opp.toFixed(3) + ' m² × ' + euro(prijs) + '/m²', val: total }
  ], total, b + ' × ' + h + ' cm — Opp: ' + opp.toFixed(3) + ' m²');
}
