// Prijsopzoeking, gelijk aan p() in v4 (regel 938).
// Een onbekende of ongeldige sleutel levert 0 op, net als in v4 — dat gedrag
// is bewust behouden omdat de calculators erop leunen (bv. doek 'geen').
export function makeLookup(prices) {
  return function p(key) {
    return parseFloat(prices[key]) || 0;
  };
}
