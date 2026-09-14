// Tarieven van het peesdoek, getoetst aan de twee goedgekeurde formulieren:
//   9  — "Peesdoek diverse materialen (1)"        (geen levertijdvarianten)
//   57 — "Peesdoek diverse materialen Deff. (1)"  (volledige levertijdmatrix)
//
// Beide dragen het achtervoegsel (1) en gelden dus allebei. Waar ze elkaar
// tegenspreken krijgt een sleutel meerdere tests, elk met het formulier erbij;
// hooguit één daarvan kan slagen. Dat is de bedoeling: de tegenstrijdigheid
// hoort zichtbaar te zijn, niet weggepoetst.

import { describe, it, expect } from 'vitest';
import { formulier, tarief, label } from './helpers/gf-bron.js';
import { PEESDOEK_BRONNEN, PD_57 } from './helpers/woordenboek.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

for (const bron of PEESDOEK_BRONNEN) {
  const form = formulier(bron.index);

  const tarieven = Object.entries(bron.tarieven).map(([id, sleutel]) => ({
    id, sleutel, bedrag: tarief(form, id), omschrijving: label(form, id),
  }));

  describe(`peesdoek — tarieven uit "${form.titel}"`, () => {
    it.each(tarieven)('$sleutel — $omschrijving (veld $id)', ({ sleutel, bedrag }) => {
      expect(bedrag).not.toBeNull();
      expect(DEFAULTS[sleutel]).toBe(bedrag);
    });
  });
}

describe('peesdoek — dekking', () => {
  it('formulier 57 dekt alle zestien prijssleutels van het product', () => {
    const gedekt = Object.values(PD_57.tarieven).sort();
    const verwacht = Object.keys(DEFAULTS).filter(k => k.startsWith('pd_')).sort();
    expect(gedekt).toEqual(verwacht);
  });
});
