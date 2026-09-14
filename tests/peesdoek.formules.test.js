// Formules van het peesdoek, getoetst aan formulier 9 en 57.
//
// Beide formulieren rekenen ((omtrek*pees + opp*doek)/100) — de deling door
// 100 aan het eind zit dus echt in de bron en is geen eigenaardigheid van v4.
//
// Twee blokken per formulier:
//   formulevorm — bron en calculator rekenen met dezelfde tarieven uit de
//                 export; een verschil zit dan in de opbouw van de berekening.
//   eindbedrag  — de calculator rekent met zijn eigen prijstabel.

import { describe, it, expect } from 'vitest';
import { formulier, productVelden, rekenVelden, conditie } from './helpers/gf-bron.js';
import { evalFormule, prijstabelUit } from './helpers/gf-formule.js';
import { PD_9, PD_57, MATEN } from './helpers/woordenboek.js';
import { pricePeesdoek } from '../src/pricing/peesdoek.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

// Formulier 9 stuurt op één keuzeveld, formulier 57 op materiaal plus
// levertijd. Beide leveren een waarde van #pd-doek op.
function doekKeuzeVan(bron, cond) {
  if (bron === PD_9) return bron.doek[cond['9']];
  const materiaal = bron.materiaal[cond['50'] ?? cond['51']];
  return materiaal + bron.levertijd[cond['52']];
}

for (const bron of [PD_9, PD_57]) {
  const form = formulier(bron.index);
  const UIT_BRON = prijstabelUit(form, bron.tarieven);

  const gevallen = [];
  for (const productVeld of productVelden(form)) {
    const doek = doekKeuzeVan(bron, conditie(productVeld));
    for (const [breedte, hoogte] of MATEN) {
      gevallen.push({
        naam: `${doek}, ${breedte}×${hoogte}`,
        formule: productVeld.calculationFormula,
        invoer: { [bron.breedte]: breedte, [bron.hoogte]: hoogte },
        argumenten: { breedte, hoogte, doek },
      });
    }
  }

  describe(`peesdoek — hulpformules uit "${form.titel}"`, () => {
    const omtrek = rekenVelden(form).find(v => v.label.startsWith('Omtrek'));
    const opp = rekenVelden(form).find(v => v.label === 'Oppervlakte');

    it.each(MATEN)('omtrek bij %s×%s cm', (breedte, hoogte) => {
      const invoer = { [bron.breedte]: breedte, [bron.hoogte]: hoogte };
      const uitBron = evalFormule(form, omtrek.calculationFormula, invoer);
      expect(pricePeesdoek({ breedte, hoogte, doek: 'eco' }, DEFAULTS).omtrek).toBe(uitBron);
    });

    it.each(MATEN)('oppervlakte bij %s×%s cm', (breedte, hoogte) => {
      const invoer = { [bron.breedte]: breedte, [bron.hoogte]: hoogte };
      const uitBron = evalFormule(form, opp.calculationFormula, invoer);
      expect(pricePeesdoek({ breedte, hoogte, doek: 'eco' }, DEFAULTS).opp).toBe(uitBron);
    });
  });

  describe(`peesdoek — formulevorm uit "${form.titel}"`, () => {
    it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
      const uitBron = evalFormule(form, formule, invoer);
      expect(pricePeesdoek(argumenten, UIT_BRON).total).toBeCloseTo(uitBron, 9);
    });
  });

  describe(`peesdoek — eindbedrag uit "${form.titel}"`, () => {
    it.each(gevallen)('$naam', ({ formule, invoer, argumenten }) => {
      const uitBron = evalFormule(form, formule, invoer);
      expect(pricePeesdoek(argumenten, DEFAULTS).total).toBeCloseTo(uitBron, 9);
    });
  });
}

describe('peesdoek — bit-identiek', () => {
  // Het totaal deelt de som door 100; de losse regels delen elk apart. Dat
  // verschil in de laatste bit is gedrag van v4 en hoort zo te blijven.
  it('ecodisplay 137,5×42,7 cm volgens formulier 57', () => {
    const form = formulier(PD_57.index);
    const UIT_BRON = prijstabelUit(form, PD_57.tarieven);
    const veld = productVelden(form).find(v => {
      const c = conditie(v);
      return c['50'] === 'Dekostof (meest gebruikt)' && c['52'] === '5 werkdagen';
    });
    const invoer = { [PD_57.breedte]: 137.5, [PD_57.hoogte]: 42.7 };
    const uitBron = evalFormule(form, veld.calculationFormula, invoer);
    const uitCode = pricePeesdoek({ breedte: 137.5, hoogte: 42.7, doek: 'eco' }, UIT_BRON).total;
    expect(uitCode).toBe(uitBron);
  });
});
