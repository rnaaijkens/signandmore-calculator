import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceVlag } from '../pricing/vlag.js';

export function calcVlag() {
  const b = n('vl-breedte'), h = n('vl-hoogte');
  if (!b || !h) { clearResult('vl-result'); return; }

  const mat = v('vl-materiaal');

  const { opp, prijs, total } =
    priceVlag({ breedte: b, hoogte: h, materiaal: mat }, getPrices());

  renderResult('vl-result', [
    { label: `${mat.replace('_', ' ')} — ${opp.toFixed(3)} m² × ${euro(prijs)}/m²`, val: total }
  ], total, `${b} × ${h} cm — Opp: ${opp.toFixed(3)} m²`);
}
