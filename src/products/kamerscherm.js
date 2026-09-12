import { n, v, clearResult } from '../dom.js';
import { renderResult } from '../result.js';
import { getPrices } from '../priceStore.js';
import { priceKamerscherm } from '../pricing/kamerscherm.js';

export function calcKamerscherm() {
  const b      = n('ks-breedte'), h = n('ks-hoogte');
  const aantal = n('ks-aantal') || 1;
  if (!b || !h) { clearResult('ks-result'); return; }

  const frame       = v('ks-frame');
  const akoestiekIn = v('ks-akoestiek');

  const { omtrek, hoeken, scharnier, vloerplaten, akoestiekAan,
          frameKosten, peesKosten, doekKosten, akoestiekKosten, total } =
    priceKamerscherm({ breedte: b, hoogte: h, aantal, frame, akoestiek: akoestiekIn }, getPrices());

  renderResult('ks-result', [
    { label: 'Vloerplaten (basis)', val: vloerplaten },
    { label: `Scharnieren — ${aantal}×`, val: scharnier * aantal },
    { label: `Frame ${frame}mm — ${aantal}× ${omtrek.toFixed(2)} m`, val: frameKosten * aantal },
    { label: `Pees ×2 — ${aantal} schermen`, val: peesKosten * aantal },
    { label: `Peesdoek 2 zijden — ${aantal} schermen`, val: doekKosten * aantal },
    { label: `4 hoeken — ${aantal}×`, val: hoeken * aantal },
    ...(akoestiekAan ? [{ label: `Akoestiek — ${aantal} schermen`, val: akoestiekKosten * aantal }] : [])
  ], total,
  `${aantal} scherm(en) van ${b}×${h} cm — Prijs excl. BTW`);
}
