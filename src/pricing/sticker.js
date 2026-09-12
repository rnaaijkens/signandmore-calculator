import { makeLookup } from './lookup.js';

// Stickers / folie — v4 regels 1249-1256.
export function priceSticker({ breedte, hoogte, materiaal, levertijd }, prices) {
  const p = makeLookup(prices);
  const opp = (breedte * hoogte) / 10000;
  const prijs = p(`st_${materiaal}_${levertijd}`);
  const total = opp * prijs;
  return { opp, prijs, total };
}
