import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceSticker } from '../pricing/sticker.js';

export function calcSticker() {
  const b = n('st-breedte'), h = n('st-hoogte');
  if (!b || !h) { clearResult('st-result'); return; }

  const mat = v('st-materiaal');
  const lvt = v('st-levertijd');

  const { opp, prijs, total } =
    priceSticker({ breedte: b, hoogte: h, materiaal: mat, levertijd: lvt }, getPrices());

  renderResult('st-result', [
    { label: mat + ' ' + lvt + ' wkd — ' + opp.toFixed(3) + ' m² × ' + euro(prijs) + '/m²', val: total }
  ], total, b + ' × ' + h + ' cm — Opp: ' + opp.toFixed(3) + ' m²');
}
