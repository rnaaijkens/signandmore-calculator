import { makeLookup } from './lookup.js';

// Kamerschermen — v4 regels 1144-1168.
// Let op: het totaal telt niet op tot de som van de regels in de breakdown.
// `- scharnier` in het totaal heeft geen tegenhanger in de getoonde regels;
// dat is gedrag van v4 en blijft bewust ongewijzigd.
export function priceKamerscherm({ breedte, hoogte, aantal, frame, akoestiek }, prices) {
  const p = makeLookup(prices);
  const b = breedte, h = hoogte;

  const omtrek = (b + h) / 50;
  const opp    = (b * h) / 10000;
  const akoestiekAan = parseInt(akoestiek);

  const framePerM   = p(`ks_${frame}_frame`);
  const pees        = p('ks_pees');
  const hoeken      = p('ks_hoeken');
  const doekPerM2   = p('ks_peesdoek');
  const scharnier   = p('ks_scharnier');
  const vloerplaten = p('ks_vloerplaten');
  const akoestiekM2 = p(`ks_akoestiek_${frame}`);

  const frameKosten     = omtrek * framePerM;
  const peesKosten      = omtrek * 2 * pees;
  const doekKosten      = opp * 2 * doekPerM2;
  const akoestiekKosten = akoestiekAan * opp * akoestiekM2;

  const perScherm = scharnier + frameKosten + peesKosten + doekKosten + akoestiekKosten + hoeken;
  const total = vloerplaten - scharnier + aantal * perScherm;

  return { omtrek, opp, framePerM, pees, hoeken, doekPerM2, scharnier, vloerplaten,
           akoestiekM2, akoestiekAan, frameKosten, peesKosten, doekKosten,
           akoestiekKosten, perScherm, total };
}
