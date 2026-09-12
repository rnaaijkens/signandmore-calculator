import { n, v, clearResult } from '../dom.js';
import { euro } from '../format.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceWandframe } from '../pricing/wandframe.js';

export function calcWandframe() {
  const b = n('wf-breedte'), h = n('wf-hoogte');
  if (!b || !h) { clearResult('wf-result'); return; }

  const dikte     = v('wf-dikte');
  const kleur     = v('wf-kleur');
  const doekKeuze = v('wf-doek');

  const { omtrek, opp, framePerM, doekPerM2, pees, muur, hoeken,
          frameKosten, peesKosten, doekKosten, metDoek, total } =
    priceWandframe({ breedte: b, hoogte: h, dikte, kleur, doek: doekKeuze }, getPrices());

  renderResult('wf-result', [
    { label: `Frame ${dikte}mm ${kleur} — ${omtrek.toFixed(2)} m × ${euro(framePerM)}/m`, val: frameKosten },
    { label: 'Muurbevestiging', val: muur },
    { label: '4 hoeken', val: hoeken },
    ...(metDoek ? [
      { label: `Pees — ${omtrek.toFixed(2)} m × ${euro(pees)}/m`, val: peesKosten },
      { label: `Doek (${doekKeuze}) — ${opp.toFixed(3)} m² × ${euro(doekPerM2)}/m²`, val: doekKosten },
    ] : [])
  ], total,
  `${b} × ${h} cm — Omtrek: ${omtrek.toFixed(2)} m — Opp: ${opp.toFixed(3)} m²`);
}
