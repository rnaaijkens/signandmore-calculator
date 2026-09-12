import { makeLookup } from './lookup.js';

// Wand LED-frame — v4 regels 1114-1133.
// LED wordt per strekkende meter omtrek gerekend; de deling door 100 bij
// doekKosten komt uit v4 en blijft staan.
export function priceWandLED({ breedte, hoogte, dikte, kleur }, prices) {
  const p = makeLookup(prices);
  const b = breedte, h = hoogte;

  const omtrek = (h + b + b + h) / 100;
  const opp    = (b * h) / 10000;

  const framePerM = p(`wl_${dikte}_${kleur}`);
  const led       = p('wl_led');
  const pees      = p('wl_pees');
  const doekPerM2 = p('wl_peesdoek');

  const frameKosten = omtrek * framePerM;
  const ledKosten   = omtrek * led;
  const peesKosten  = omtrek * pees;
  const doekKosten  = opp * doekPerM2 / 100;

  const total = frameKosten + ledKosten + peesKosten + doekKosten;

  return { omtrek, opp, framePerM, led, pees, doekPerM2,
           frameKosten, ledKosten, peesKosten, doekKosten, total };
}
