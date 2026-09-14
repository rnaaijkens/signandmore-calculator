// Formules van het vrijstaande textielframe, getoetst aan formulier 7
// ("Vrijstaande textielframes (1)").
//
// Twee blokken, zodat een rode test meteen zegt wát er mis is:
//   formulevorm — bron en calculator rekenen met dezelfde tarieven uit de
//                 export; een verschil zit dan in de opbouw van de berekening.
//   eindbedrag  — de calculator rekent met zijn eigen prijstabel; een verschil
//                 dat hier pas opduikt zit in de tarieven.

import { describe, it, expect } from 'vitest';
import { formulier, productVelden, rekenVelden, keuzes, conditie, getal } from './helpers/gf-bron.js';
import { evalFormule, prijstabelUit } from './helpers/gf-formule.js';
import { VR, MATEN } from './helpers/woordenboek.js';
import { priceVrijstaand } from '../src/pricing/vrijstaand.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

const form = formulier(VR.index);

// Prijstabel zoals de export hem kent, inclusief de twee bevestigingsbedragen
// die in de keuzewaarden van veld 52 staan.
const UIT_BRON = prijstabelUit(form, VR.tarieven);
for (const keuze of keuzes(form, VR.bevestiging)) {
  UIT_BRON[VR.bevestigingKeuzes[keuze.waarde].sleutel] = getal(keuze.waarde);
}

const gevallen = [];
for (const productVeld of productVelden(form)) {
  const cond = conditie(productVeld);
  const dikte = VR.dikte[cond['49']];
  const kleur = VR.kleur[cond['61']];

  for (const keuze of keuzes(form, VR.bevestiging)) {
    const { optie, sleutel } = VR.bevestigingKeuzes[keuze.waarde];
    for (const akoestiek of ['0', '1']) {
      for (const [breedte, hoogte] of MATEN) {
        gevallen.push({
          naam: `${dikte}mm ${kleur}, ${optie}, akoestiek ${akoestiek}, ${breedte}×${hoogte}`,
          formule: productVeld.calculationFormula,
          invoer: {
            [VR.breedte]: breedte,
            [VR.hoogte]: hoogte,
            [VR.akoestiek]: Number(akoestiek),
            [VR.bevestiging]: UIT_BRON[sleutel],
          },
          argumenten: { breedte, hoogte, dikte, kleur, bevestiging: optie, akoestiek },
        });
      }
    }
  }
}

describe(`vrijstaand textielframe — hulpformules uit "${form.titel}"`, () => {
  const omtrek = rekenVelden(form).find(v => v.label.startsWith('Omtrek'));
  const opp = rekenVelden(form).find(v => v.label === 'Oppervlakte');

  it.each(MATEN)('omtrek bij %s×%s cm', (breedte, hoogte) => {
    const invoer = { [VR.breedte]: breedte, [VR.hoogte]: hoogte };
    const uitBron = evalFormule(form, omtrek.calculationFormula, invoer);
    const uitCode = priceVrijstaand(
      { breedte, hoogte, dikte: '44', kleur: 'alu', bevestiging: 'hangend', akoestiek: '0' },
      DEFAULTS,
    ).omtrek;
    expect(uitCode).toBe(uitBron);
  });

  it.each(MATEN)('oppervlakte bij %s×%s cm', (breedte, hoogte) => {
    const invoer = { [VR.breedte]: breedte, [VR.hoogte]: hoogte };
    const uitBron = evalFormule(form, opp.calculationFormula, invoer);
    const uitCode = priceVrijstaand(
      { breedte, hoogte, dikte: '44', kleur: 'alu', bevestiging: 'hangend', akoestiek: '0' },
      DEFAULTS,
    ).opp;
    expect(uitCode).toBe(uitBron);
  });
});

describe(`vrijstaand textielframe — formulevorm uit "${form.titel}"`, () => {
  it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
    const uitBron = evalFormule(form, formule, invoer);
    const uitCode = priceVrijstaand(argumenten, UIT_BRON).total;
    expect(uitCode).toBeCloseTo(uitBron, 9);
  });
});

describe(`vrijstaand textielframe — eindbedrag uit "${form.titel}"`, () => {
  it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
    const uitBron = evalFormule(form, formule, invoer);
    const uitCode = priceVrijstaand(argumenten, DEFAULTS).total;
    expect(uitCode).toBeCloseTo(uitBron, 9);
  });
});

describe('vrijstaand textielframe — bit-identiek', () => {
  // De bron telt de doekkosten twee keer op als opp*peesdoek/100; de calculator
  // rekent opp*doekPerM2*2/100. Algebraïsch gelijk, maar in drijvendekomma niet
  // per se tot op de laatste bit. Deze test legt vast of dat hier uitmaakt.
  it('44mm aluminium, hangend, zonder akoestiek, 137,5×42,7 cm', () => {
    const veld = productVelden(form).find(v => {
      const c = conditie(v);
      return c['49'] === '44 mm' && c['61'] === 'Aluminium (meest gekozen)';
    });
    const invoer = {
      [VR.breedte]: 137.5, [VR.hoogte]: 42.7,
      [VR.akoestiek]: 0, [VR.bevestiging]: UIT_BRON.vr_hangend,
    };
    const uitBron = evalFormule(form, veld.calculationFormula, invoer);
    const uitCode = priceVrijstaand(
      { breedte: 137.5, hoogte: 42.7, dikte: '44', kleur: 'alu', bevestiging: 'hangend', akoestiek: '0' },
      UIT_BRON,
    ).total;
    expect(uitCode).toBe(uitBron);
  });
});
