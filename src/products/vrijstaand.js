import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceVrijstaand } from '../pricing/vrijstaand.js';

export function calcVrijstaand() {
  const b = n('vr-breedte'), h = n('vr-hoogte');
  if (!b || !h) { clearResult('vr-result'); return; }

  const dikte       = v('vr-dikte');
  const kleur       = v('vr-kleur');
  const bevKeuze    = v('vr-bevestiging');
  const akoestiekIn = v('vr-akoestiek');

  const { omtrek, opp, framePerM, pees, hoeken, akoestiekAan, bevestiging,
          frameKosten, peesKosten, doekKosten, akoestiekKosten, total } =
    priceVrijstaand({ breedte: b, hoogte: h, dikte, kleur,
                      bevestiging: bevKeuze, akoestiek: akoestiekIn }, getPrices());

  renderResult('vr-result', [
    { label: `Frame ${dikte}mm ${kleur} — ${omtrek.toFixed(2)} m × ${euro(framePerM)}/m`, val: frameKosten },
    { label: `Pees ×2 — ${omtrek.toFixed(2)} m × ${euro(pees)}/m`, val: peesKosten },
    { label: `Peesdoek 2 zijden — ${opp.toFixed(3)} m²`, val: doekKosten },
    { label: '4 hoeken', val: hoeken },
    { label: `Bevestiging (${bevKeuze})`, val: bevestiging },
    ...(akoestiekAan ? [{ label: `Akoestiek foam — ${opp.toFixed(3)} m²`, val: akoestiekKosten }] : [])
  ], total,
  `${b} × ${h} cm — Omtrek: ${omtrek.toFixed(2)} m — Opp: ${opp.toFixed(3)} m²`);
}
