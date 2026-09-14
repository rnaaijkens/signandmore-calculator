// Rekent een Gravity Forms `calculationFormula` uit.
//
// Een formule bestaat uit merge tags `{Label:veldId}` met daartussen gewoon
// rekenwerk. Alleen het id na de dubbele punt telt: het label ervoor is
// cosmetisch en loopt in de export regelmatig achter op het echte veldlabel.
//
// De operatievolgorde van de bron blijft letterlijk staan. Een merge tag wordt
// vervangen door het getal tussen haakjes, wat de volgorde niet verandert maar
// wel voorkomt dat een negatieve waarde de expressie verminkt. Algebraïsch
// gelijk is namelijk niet hetzelfde als bit-identiek, en juist dat verschil
// willen we kunnen zien.

import { veld, getal } from './gf-bron.js';

const TAG = /\{[^{}:]*:(\d+(?:\.\d+)?)\}/g;

// De veld-id's waar een formule naar verwijst, in volgorde van voorkomen.
export function verwijzingen(formule) {
  return [...formule.matchAll(TAG)].map(m => m[1]);
}

// Verwijzingen naar velden die in dit formulier niet bestaan. Gravity Forms
// rekent die als 0; deze functie maakt zichtbaar wélke dat zijn.
export function ontbrekendeVerwijzingen(form, formule) {
  return [...new Set(verwijzingen(formule))].filter(id => !veld(form, id));
}

function waardeVan(form, id, invoer, bezocht) {
  if (Object.prototype.hasOwnProperty.call(invoer, id)) return invoer[id];

  const f = veld(form, id);
  if (!f) return 0; // Gravity Forms rekent een ontbrekende verwijzing als 0.

  if (f.calculationFormula) {
    // Een hulpveld (Omtrek, Oppervlakte) wordt eerst zelf tot een getal
    // uitgerekend en dan ingevuld — net als in GF, en net als de prijsfuncties
    // die `omtrek` en `opp` als losse getallen doorgeven.
    if (bezocht.has(id)) throw new Error(`Kringverwijzing via veld ${id}`);
    return evalFormule(form, f.calculationFormula, invoer, new Set([...bezocht, id]));
  }

  return getal(f.defaultValue) ?? 0;
}

function rekenUit(expressie) {
  if (!/^[\d\s.+\-*/()]+$/.test(expressie)) {
    throw new Error(`Na het invullen bleef er iets anders dan rekenwerk over: ${expressie}`);
  }
  return Function(`"use strict"; return (${expressie});`)();
}

// `invoer` koppelt veld-id aan getal: de afmetingen en de gekozen waarden.
// Alles wat daar niet in staat komt uit het formulier zelf.
export function evalFormule(form, formule, invoer = {}, bezocht = new Set()) {
  const ingevuld = formule.replace(TAG, (_, id) => `(${waardeVan(form, id, invoer, bezocht)})`);
  return rekenUit(ingevuld);
}

// Bouwt een prijstabel zoals de prijsfuncties die verwachten, gevuld met de
// tarieven uit dit formulier. Sleutels die het formulier niet kent blijven weg;
// `makeLookup` maakt daar vanzelf 0 van, net als Gravity Forms.
export function prijstabelUit(form, veldNaarSleutel) {
  const tabel = {};
  for (const [id, sleutel] of Object.entries(veldNaarSleutel)) {
    const f = veld(form, id);
    if (!f) continue;
    const bedrag = getal(f.defaultValue);
    if (bedrag !== null) tabel[sleutel] = bedrag;
  }
  return tabel;
}
