import { makeLookup } from './lookup.js';

// Beschikbare afmetingen per type — v4 regels 1212-1217.
export const BV_SIZES = {
  straight: ['80x220', '80x315', '90x430'],
  square:   ['75x200', '75x300', '75x400'],
  wave:     ['65x150', '65x260', '65x370'],
  drop:     ['85x220', '85x330', '85x440'],
};

// Beachvlag — v4 regels 1229-1238. Vaste stukprijs, geen afmetingen invoer.
export function priceBeachvlag({ type, afmeting, metMast, aantal }, prices) {
  const p = makeLookup(prices);
  const flagPrijs = p(`bv_${type}_${afmeting}`);
  const mastPrijs = metMast ? p(`bv_mast_${type}_${afmeting}`) : 0;
  const total = (flagPrijs + mastPrijs) * aantal;
  return { flagPrijs, mastPrijs, total };
}
