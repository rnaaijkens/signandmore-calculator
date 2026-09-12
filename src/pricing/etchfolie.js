import { makeLookup } from './lookup.js';

// Etchfolie / raamfolie — v4 regels 1263-1269.
export function priceEtchfolie({ breedte, hoogte, levertijd }, prices) {
  const p = makeLookup(prices);
  const opp = (breedte * hoogte) / 10000;
  const prijs = p(`ef_${levertijd}`);
  const total = opp * prijs;
  return { opp, prijs, total };
}
