// Tarieven van het vrijstaande textielframe, getoetst aan formulier 7
// ("Vrijstaande textielframes (1)") — het enige goedgekeurde formulier voor
// dit product.
//
// De bron is leidend: faalt een test, dan wijkt de calculator af van de
// export, niet andersom.

import { describe, it, expect } from 'vitest';
import { formulier, tarief, label, keuzes, getal } from './helpers/gf-bron.js';
import { VR } from './helpers/woordenboek.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

const form = formulier(VR.index);

const uitVerborgenVelden = Object.entries(VR.tarieven).map(([id, sleutel]) => ({
  id, sleutel, bedrag: tarief(form, id), omschrijving: label(form, id),
}));

// Hangend en grondplaten staan niet in een verborgen veld maar in de
// keuzewaarde van veld 52.
const uitKeuzes = keuzes(form, VR.bevestiging).map(keuze => ({
  id: `${VR.bevestiging} (${keuze.tekst})`,
  sleutel: VR.bevestigingKeuzes[keuze.waarde].sleutel,
  bedrag: getal(keuze.waarde),
  omschrijving: keuze.tekst,
}));

const tarieven = [...uitVerborgenVelden, ...uitKeuzes];

describe(`vrijstaand textielframe — tarieven uit "${form.titel}"`, () => {
  it('alle dertien prijssleutels van het product zijn gedekt', () => {
    const gedekt = tarieven.map(t => t.sleutel).sort();
    const verwacht = Object.keys(DEFAULTS).filter(k => k.startsWith('vr_')).sort();
    expect(gedekt).toEqual(verwacht);
  });

  it.each(tarieven)('$sleutel — $omschrijving (veld $id)', ({ sleutel, bedrag }) => {
    expect(bedrag).not.toBeNull();
    expect(DEFAULTS[sleutel]).toBe(bedrag);
  });
});
