import { euro } from './format.js';

// BTW-tarief zoals v4 het toepast (regels 998 en 1004): over het onafgeronde
// totaal, en pas bij weergave afgerond. Schrijf 1.21 als literal — 1 + 0.21
// levert in floating point niet gegarandeerd dezelfde double op.
export const BTW_FACTOR = 1.21;

// Resultaatweergave, overgenomen uit v4 regels 984-1010.
export function renderResult(containerId, breakdown, total, note) {
  const el = document.getElementById(containerId);
  if (total <= 0 || isNaN(total)) {
    el.innerHTML = '<div class="empty">Voer afmetingen in om de prijs te berekenen.</div>';
    return;
  }
  const rows = breakdown.map(r =>
    `<div class="breakdown-row"><span class="key">${r.label}</span><span class="val">${euro(r.val)}</span></div>`
  ).join('');

  el.innerHTML = `
    <div class="breakdown" style="margin-top:20px">
      ${rows}
      <div class="breakdown-row total"><span>Totaal excl. BTW</span><span>${euro(total)}</span></div>
      <div class="breakdown-row total-btw"><span>Totaal incl. BTW (21%)</span><span>${euro(total * BTW_FACTOR)}</span></div>
    </div>
    <div class="result-box">
      <div>
        <div class="label">Prijs excl. BTW</div>
        <div class="price">${euro(total)}</div>
        <div class="sub">incl. BTW: ${euro(total * BTW_FACTOR)}</div>
      </div>
      <button class="btn-pdf" onclick="window.print()">Afdrukken / PDF</button>
    </div>
    ${note ? `<p class="note">${note}</p>` : ''}
  `;
}
