import { makeLookup } from './lookup.js';

// Vrijstaand textielframe — v4 regels 1078-1101.
// De deling door 100 bij doekKosten komt uit v4 en blijft staan.
export function priceVrijstaand({ breedte, hoogte, dikte, kleur, bevestiging, akoestiek }, prices) {
  const p = makeLookup(prices);
  const b = breedte, h = hoogte;

  const omtrek = (h + b + b + h) / 100;
  const opp    = (b * h) / 10000;
  const bevKey = bevestiging === 'hangend' ? 'vr_hangend' : 'vr_grondplaten';
  const akoestiekAan = parseInt(akoestiek);

  const framePerM   = p(`vr_${dikte}_${kleur}`);
  const pees        = p('vr_pees');
  const hoeken      = p('vr_hoeken');
  const doekPerM2   = p('vr_peesdoek');
  const bevestigingKosten = p(bevKey);
  const akoestiekM2 = p(`vr_akoestiek_${dikte}`);

  const frameKosten     = omtrek * framePerM;
  const peesKosten      = omtrek * pees;
  const doekKosten      = opp * doekPerM2 * 2 / 100;
  const akoestiekKosten = akoestiekAan * opp * akoestiekM2;

  const total = frameKosten + peesKosten + doekKosten + hoeken + bevestigingKosten + akoestiekKosten;

  return { omtrek, opp, framePerM, pees, hoeken, doekPerM2, akoestiekM2, akoestiekAan,
           bevestiging: bevestigingKosten, frameKosten, peesKosten, doekKosten,
           akoestiekKosten, total };
}
