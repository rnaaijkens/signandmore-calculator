import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { pricePeesdoek } from '../pricing/peesdoek.js';

export function calcPeesdoek() {
  const b = n('pd-breedte'), h = n('pd-hoogte');
  if (!b || !h) { clearResult('pd-result'); return; }

  const doekKeuze = v('pd-doek');

  const { opp, omtrek, pees, doekPerM2, doekRegel, peesRegel, total } =
    pricePeesdoek({ breedte: b, hoogte: h, doek: doekKeuze }, getPrices());

  renderResult('pd-result', [
    { label: `Peesdoek — ${opp.toFixed(3)} m² × ${euro(doekPerM2)}/m²`, val: doekRegel },
    { label: `Pees — ${omtrek.toFixed(2)} m × ${euro(pees)}/m`, val: peesRegel },
  ], total,
  `${b} × ${h} cm — Opp: ${opp.toFixed(3)} m²`);
}
