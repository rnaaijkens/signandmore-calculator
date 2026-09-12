import { makeLookup } from './lookup.js';

// Wand textielframe — v4 regels 1013-1035.
export function priceWandframe({ breedte, hoogte, dikte, kleur, doek }, prices) {
  const p = makeLookup(prices);
  const b = breedte, h = hoogte;

  const omtrek = (h + b + b + h) / 100;
  const opp    = (b * h) / 10000;

  const framePerM = p(`wf_${dikte}_${kleur}`);
  const doekPerM2 = doek === 'geen' ? 0 : p(`doek_${doek}`);
  const pees      = p('wf_pees');
  const muur      = p('wf_muurbevestiging');
  const hoeken    = p('wf_hoeken');

  const frameKosten = omtrek * framePerM;
  const peesKosten  = omtrek * pees;
  const doekKosten  = opp * doekPerM2;
  const metDoek     = doek !== 'geen';

  const total = frameKosten + muur + hoeken + (metDoek ? peesKosten + doekKosten : 0);

  return { omtrek, opp, framePerM, doekPerM2, pees, muur, hoeken,
           frameKosten, peesKosten, doekKosten, metDoek, total };
}
