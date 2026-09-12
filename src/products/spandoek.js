import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceSpandoek } from '../pricing/spandoek.js';

export function calcSpandoek() {
  const b = n('sp-breedte'), h = n('sp-hoogte');
  if (!b || !h) { clearResult('sp-result'); return; }

  const mat = v('sp-materiaal');
  const lvt = v('sp-levertijd');

  const { opp, prijs, total } =
    priceSpandoek({ breedte: b, hoogte: h, materiaal: mat, levertijd: lvt }, getPrices());

  renderResult('sp-result', [
    { label: `${mat} ${lvt} wkd — ${opp.toFixed(3)} m² × ${euro(prijs)}/m²`, val: total }
  ], total, `${b} × ${h} cm — Opp: ${opp.toFixed(3)} m²`);
}
