import { makeLookup } from './lookup.js';

// Spandoek — v4 regels 1182-1190.
export function priceSpandoek({ breedte, hoogte, materiaal, levertijd }, prices) {
  const p = makeLookup(prices);
  const opp = (breedte * hoogte) / 10000;
  const prijs = p(`sp_${materiaal}_${levertijd}`);
  const total = opp * prijs;
  return { opp, prijs, total };
}
