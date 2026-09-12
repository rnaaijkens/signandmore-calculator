import { makeLookup } from './lookup.js';

// Mastvlag / baniervlag — v4 regels 1197-1204.
// De keuzewaarde bevat al een underscore (bv. 'mast_vlg'), dus de sleutel
// is simpelweg 'vl_' + de waarde.
export function priceVlag({ breedte, hoogte, materiaal }, prices) {
  const p = makeLookup(prices);
  const opp = (breedte * hoogte) / 10000;
  const prijs = p(`vl_${materiaal}`);
  const total = opp * prijs;
  return { opp, prijs, total };
}
