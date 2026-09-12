import { makeLookup } from './lookup.js';

// Keuzewaarde van #pd-doek naar prijssleutel — v4 regels 1057-1063.
export const PD_KEY_MAP = {
  eco: 'pd_eco_5', eco4: 'pd_eco_4', eco3: 'pd_eco_3',
  samba: 'pd_samba_5', samba4: 'pd_samba_4', samba3: 'pd_samba_3',
  lightex: 'pd_lightex_5', lightex4: 'pd_lightex_4', lightex3: 'pd_lightex_3',
  satijn: 'pd_satijn_5', satijn4: 'pd_satijn_4', satijn3: 'pd_satijn_3',
  theater: 'pd_theater_5', theater4: 'pd_theater_4', theater3: 'pd_theater_3',
};

// Peesdoek — v4 regels 1049-1073.
// Let op: de deling door 100 komt uit v4 en blijft bewust staan. Het totaal
// deelt de som, de losse regels delen elk apart; dat verschil in de laatste
// ULP is gedrag van v4 en wordt hier exact zo overgenomen.
export function pricePeesdoek({ breedte, hoogte, doek }, prices) {
  const p = makeLookup(prices);
  const b = breedte, h = hoogte;

  const opp    = (b * h) / 10000;
  const omtrek = (b + h) / 50;
  const pees   = p('pd_pees');

  const doekPerM2 = p(PD_KEY_MAP[doek]);

  const peesKosten = omtrek * pees;
  const doekKosten = opp * doekPerM2;
  const total = (peesKosten + doekKosten) / 100;

  return { opp, omtrek, pees, doekPerM2, peesKosten, doekKosten,
           doekRegel: doekKosten / 100, peesRegel: peesKosten / 100, total };
}
