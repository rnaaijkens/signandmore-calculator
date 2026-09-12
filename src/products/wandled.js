import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceWandLED } from '../pricing/wandled.js';

export function calcWandLED() {
  const b = n('wl-breedte'), h = n('wl-hoogte');
  if (!b || !h) { clearResult('wl-result'); return; }

  const dikte = v('wl-dikte');
  const kleur = v('wl-kleur');

  const { omtrek, opp, framePerM, led, pees,
          frameKosten, ledKosten, peesKosten, doekKosten, total } =
    priceWandLED({ breedte: b, hoogte: h, dikte, kleur }, getPrices());

  renderResult('wl-result', [
    { label: `Frame ${dikte}mm ${kleur} — ${omtrek.toFixed(2)} m × ${euro(framePerM)}/m`, val: frameKosten },
    { label: `LED strip — ${omtrek.toFixed(2)} m × ${euro(led)}/m`, val: ledKosten },
    { label: `Pees — ${omtrek.toFixed(2)} m × ${euro(pees)}/m`, val: peesKosten },
    { label: `Peesdoek — ${opp.toFixed(3)} m²`, val: doekKosten },
  ], total,
  `${b} × ${h} cm — Omtrek: ${omtrek.toFixed(2)} m`);
}
