// Formules van het wand textielframe, getoetst aan de vier goedgekeurde
// formulieren (54, 58, 60 en 63).
//
// Drie soorten blokken per formulier:
//   bron        — wat er in het formulier zelf niet klopt: verwijzingen naar
//                 velden die er niet zijn, en berekeningen voor keuzes die niet
//                 in de keuzelijst staan.
//   formulevorm — bron en calculator rekenen met dezelfde tarieven uit de
//                 export; een verschil zit dan in de opbouw van de berekening.
//   eindbedrag  — de calculator rekent met zijn eigen prijstabel.
//
// Formulier 54 en 58 verwijzen naar een doekprijs, een muurbevestiging en een
// pees die in dát formulier ontbreken. Gravity Forms rekent zo'n verwijzing als
// 0; dat doen wij ook. Hun formules kennen daarnaast een akoestiekterm die de
// calculator helemaal niet heeft.

import { describe, it, expect } from 'vitest';
import { formulier, productVelden, rekenVelden, keuzes, conditie } from './helpers/gf-bron.js';
import { evalFormule, prijstabelUit, ontbrekendeVerwijzingen } from './helpers/gf-formule.js';
import { WANDFRAME_BRONNEN, MATEN } from './helpers/woordenboek.js';
import { priceWandframe } from '../src/pricing/wandframe.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

function keuzeBestaat(form, veldId, waarde) {
  return keuzes(form, veldId).some(k => k.waarde === waarde);
}

for (const bron of WANDFRAME_BRONNEN) {
  const form = formulier(bron.index);
  const UIT_BRON = prijstabelUit(form, bron.tarieven);
  const stuur = bron.stuurvelden;

  const gevallen = [];
  const onbereikbaar = [];

  for (const productVeld of productVelden(form)) {
    const cond = conditie(productVeld);

    // Een conditie die naar een niet-bestaande keuze verwijst maakt de
    // berekening onbereikbaar; die hoort in het bron-blok, niet hier.
    const stuurt = Object.entries(stuur).filter(([, veldId]) => veldId);
    const dood = stuurt.filter(([, veldId]) => !keuzeBestaat(form, veldId, cond[veldId]));
    if (dood.length) {
      onbereikbaar.push({
        id: String(productVeld.id),
        omschrijving: productVeld.label,
        keuzes: dood.map(([, veldId]) => `veld ${veldId} = "${cond[veldId]}"`).join(', '),
      });
      continue;
    }

    const dikte = stuur.dikte ? bron.dikte[cond[stuur.dikte]] : bron.vasteDikte;
    const kleur = bron.kleur[cond[stuur.kleur]];
    const doek = stuur.doek ? bron.doek[cond[stuur.doek]] : 'geen';

    for (const akoestiek of bron.akoestiek ? ['0', '1'] : [null]) {
      for (const [breedte, hoogte] of MATEN) {
        const invoer = { [bron.breedte]: breedte, [bron.hoogte]: hoogte };
        if (akoestiek !== null) invoer[bron.akoestiek] = Number(akoestiek);
        gevallen.push({
          naam: `${dikte}mm ${kleur}, doek ${doek}`
            + (akoestiek === null ? '' : `, akoestiek ${akoestiek}`)
            + `, ${breedte}×${hoogte}`,
          formule: productVeld.calculationFormula,
          invoer,
          argumenten: { breedte, hoogte, dikte, kleur, doek },
        });
      }
    }
  }

  describe(`wand textielframe — bron "${form.titel}"`, () => {
    it('verwijst alleen naar velden die in het formulier bestaan', () => {
      const gemist = {};
      for (const productVeld of productVelden(form)) {
        const ontbreekt = ontbrekendeVerwijzingen(form, productVeld.calculationFormula);
        if (ontbreekt.length) gemist[productVeld.label] = ontbreekt;
      }
      expect(gemist).toEqual({});
    });

    it('heeft voor elke berekening een bereikbare keuzecombinatie', () => {
      expect(onbereikbaar).toEqual([]);
    });
  });

  describe(`wand textielframe — hulpformules uit "${form.titel}"`, () => {
    const omtrek = rekenVelden(form).find(v => v.label.startsWith('Omtrek'));
    const opp = rekenVelden(form).find(v => v.label.startsWith('Oppervlakte'));
    const basis = { dikte: '19', kleur: 'alu', doek: 'geen' };

    it.each(MATEN)('omtrek bij %s×%s cm', (breedte, hoogte) => {
      const invoer = { [bron.breedte]: breedte, [bron.hoogte]: hoogte };
      const uitBron = evalFormule(form, omtrek.calculationFormula, invoer);
      expect(priceWandframe({ ...basis, breedte, hoogte }, DEFAULTS).omtrek).toBe(uitBron);
    });

    it.each(MATEN)('oppervlakte bij %s×%s cm', (breedte, hoogte) => {
      const invoer = { [bron.breedte]: breedte, [bron.hoogte]: hoogte };
      const uitBron = evalFormule(form, opp.calculationFormula, invoer);
      expect(priceWandframe({ ...basis, breedte, hoogte }, DEFAULTS).opp).toBe(uitBron);
    });
  });

  describe(`wand textielframe — formulevorm uit "${form.titel}"`, () => {
    it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
      const uitBron = evalFormule(form, formule, invoer);
      expect(priceWandframe(argumenten, UIT_BRON).total).toBeCloseTo(uitBron, 9);
    });
  });

  describe(`wand textielframe — eindbedrag uit "${form.titel}"`, () => {
    it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
      const uitBron = evalFormule(form, formule, invoer);
      expect(priceWandframe(argumenten, DEFAULTS).total).toBeCloseTo(uitBron, 9);
    });
  });
}
