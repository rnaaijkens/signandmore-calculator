// Tarieven van het wand textielframe, getoetst aan de vier goedgekeurde
// formulieren:
//   54 — "Wand textielframes (1)"
//   58 — "Wand textielframe 19mm (1)"
//   60 — "Wand textielframe inclusief ful color bedrukt peesdoek (1)"
//   63 — "Wandframe plus Doek (1)"
//
// Alle vier dragen het achtervoegsel (1) en gelden dus allemaal, ook waar ze
// elkaar tegenspreken. Een sleutel krijgt daarom een test per formulier waarin
// hij voorkomt; hooguit één daarvan kan slagen. Zie
// docs/openstaande-prijsvragen.md voor wat er bij de klant uitstaat.

import { describe, it, expect } from 'vitest';
import { formulier, tarief, label } from './helpers/gf-bron.js';
import { WANDFRAME_BRONNEN } from './helpers/woordenboek.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

for (const bron of WANDFRAME_BRONNEN) {
  const form = formulier(bron.index);

  const tarieven = Object.entries(bron.tarieven).map(([id, sleutel]) => ({
    id, sleutel, bedrag: tarief(form, id), omschrijving: label(form, id),
  }));

  describe(`wand textielframe — tarieven uit "${form.titel}"`, () => {
    it.each(tarieven)('$sleutel — $omschrijving (veld $id)', ({ sleutel, bedrag }) => {
      expect(bedrag).not.toBeNull();
      expect(DEFAULTS[sleutel]).toBe(bedrag);
    });
  });
}

describe('wand textielframe — dekking', () => {
  const gedekt = new Set(WANDFRAME_BRONNEN.flatMap(b => Object.values(b.tarieven)));

  it('elke prijssleutel van het product komt in minstens één goedgekeurd formulier voor', () => {
    const verwacht = Object.keys(DEFAULTS).filter(k => k.startsWith('wf_') || k.startsWith('doek_'));
    expect([...gedekt].sort()).toEqual(verwacht.sort());
  });
});
