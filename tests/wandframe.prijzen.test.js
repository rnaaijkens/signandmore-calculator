// Tarieven van het wand textielframe, getoetst aan één goedgekeurd formulier:
//
//   index 54 / id 67 — "Wand textielframes (1)"
//
// De drie andere goedgekeurde wandframe-formulieren zijn op verzoek van de
// klant geen meetlat meer:
//
//   index 58 / id 71 — "Wand textielframe 19mm (1)"
//   index 60 / id 73 — "Wand textielframe inclusief ful color bedrukt peesdoek (1)"
//   index 63 / id 77 — "Wandframe plus Doek (1)"
//
// Wat zij afwijkend zeggen verdwijnt daarmee niet uit beeld: het staat onderaan
// in aparte blokken, met beide bedragen letterlijk. Die blokken meten de
// calculator niet, ze leggen de tegenspraak vast — wijzigt de export, dan worden
// ze rood in plaats van dat de tegenspraak stilletjes verschuift.
//
// Let op de twee nummeringen. De export is een object met de sleutels '0' t/m
// '70' — dat is de `index` in het woordenboek — en elk formulier draagt daarnaast
// zijn eigen `id`. De klant spreekt over id's, de tests draaien op index; hier
// staan ze daarom altijd samen.
//
// Zie docs/openstaande-prijsvragen.md voor wat er bij de klant uitstaat.

import { describe, it, expect } from 'vitest';
import { formulier, tarief, label } from './helpers/gf-bron.js';
import { WF_54, WF_58, WF_60, WF_63 } from './helpers/woordenboek.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

const BRON = WF_54;
const form67 = formulier(BRON.index);

// Prijssleutel -> veld-id, de omgekeerde weg van `bron.tarieven`.
function veldVoor(bron, sleutel) {
  const treffer = Object.entries(bron.tarieven).find(([, s]) => s === sleutel);
  return treffer ? treffer[0] : null;
}

// Het bedrag dat een formulier voor een prijssleutel noemt, of null als het die
// sleutel niet kent.
function bedragVoor(bron, sleutel) {
  const id = veldVoor(bron, sleutel);
  return id === null ? null : tarief(formulier(bron.index), id);
}

const GEDEKT = Object.values(BRON.tarieven);

const tarieven = Object.entries(BRON.tarieven).map(([id, sleutel]) => ({
  id, sleutel, bedrag: tarief(form67, id), omschrijving: label(form67, id),
}));

describe(`wand textielframe — tarieven uit "${form67.titel}" (id ${form67.id})`, () => {
  it.each(tarieven)('$sleutel — $omschrijving (veld $id)', ({ sleutel, bedrag }) => {
    expect(bedrag).not.toBeNull();
    expect(DEFAULTS[sleutel]).toBe(bedrag);
  });
});

describe('wand textielframe — dekking', () => {
  const alle = Object.keys(DEFAULTS).filter(k => k.startsWith('wf_') || k.startsWith('doek_'));

  it('formulier 67 dekt de 19 mm- en 27 mm-tarieven en de hoeken', () => {
    expect([...GEDEKT].sort()).toEqual([
      'wf_19_alu', 'wf_19_wit', 'wf_19_zwart',
      'wf_27_alu', 'wf_27_wit', 'wf_27_zwart',
      'wf_hoeken',
    ]);
  });

  it('de overige prijssleutels hebben geen goedgekeurde bron meer', () => {
    expect(alle.filter(k => !GEDEKT.includes(k)).sort()).toEqual([
      'doek_eco', 'doek_lightex', 'doek_samba', 'doek_satijn', 'doek_theater',
      'wf_25_alu', 'wf_25_wit', 'wf_25_zwart',
      'wf_muurbevestiging', 'wf_pees',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Tegenspraak: sleutels die 67 óók kent, maar met een ander bedrag
// ---------------------------------------------------------------------------

const TEGENSPRAAK = [
  { bron: WF_60, id: 73, sleutel: 'wf_19_alu', in67: 11, elders: 12 },
  { bron: WF_60, id: 73, sleutel: 'wf_19_zwart', in67: 13.35, elders: 14 },
  { bron: WF_60, id: 73, sleutel: 'wf_19_wit', in67: 13.35, elders: 14 },
  { bron: WF_60, id: 73, sleutel: 'wf_27_alu', in67: 21.85, elders: 21 },
  { bron: WF_60, id: 73, sleutel: 'wf_27_zwart', in67: 25.50, elders: 24.57 },
  { bron: WF_60, id: 73, sleutel: 'wf_27_wit', in67: 25.50, elders: 24.57 },

  { bron: WF_63, id: 77, sleutel: 'wf_19_zwart', in67: 13.35, elders: 14 },
  { bron: WF_63, id: 77, sleutel: 'wf_19_wit', in67: 13.35, elders: 14 },
  { bron: WF_63, id: 77, sleutel: 'wf_27_alu', in67: 21.85, elders: 22 },
  { bron: WF_63, id: 77, sleutel: 'wf_27_zwart', in67: 25.50, elders: 24.50 },
  { bron: WF_63, id: 77, sleutel: 'wf_27_wit', in67: 25.50, elders: 24.50 },
];

describe('wand textielframe — tegenspraak met formulier 67', () => {
  it.each(TEGENSPRAAK)(
    'formulier $id zegt € $elders waar 67 € $in67 zegt ($sleutel)',
    ({ bron, sleutel, in67, elders }) => {
      expect(bedragVoor(BRON, sleutel)).toBe(in67);
      expect(bedragVoor(bron, sleutel)).toBe(elders);
      expect(DEFAULTS[sleutel]).toBe(in67);
    },
  );

  it('formulier 71 spreekt 67 nergens tegen', () => {
    const gedeeld = Object.values(WF_58.tarieven).filter(s => GEDEKT.includes(s));
    expect([...gedeeld].sort()).toEqual(['wf_19_alu', 'wf_19_wit', 'wf_19_zwart', 'wf_hoeken']);

    const verschillen = gedeeld.filter(s => bedragVoor(WF_58, s) !== bedragVoor(BRON, s));
    expect(verschillen).toEqual([]);
  });

  it('de pees is € 3,91 in formulier 71 en € 3,15 in 73 en 77; 67 noemt hem niet', () => {
    expect(bedragVoor(BRON, 'wf_pees')).toBeNull();
    expect(bedragVoor(WF_58, 'wf_pees')).toBe(3.91);
    expect(bedragVoor(WF_60, 'wf_pees')).toBe(3.15);
    expect(bedragVoor(WF_63, 'wf_pees')).toBe(3.15);
    expect(DEFAULTS.wf_pees).toBe(3.91);
  });
});

// ---------------------------------------------------------------------------
// Sleutels waar 67 helemaal niets over zegt
// ---------------------------------------------------------------------------

// De 25 mm-prijzen van de calculator staan in géén goedgekeurd formulier: ze
// komen uit "Wand textielframe 25" (id 72), dat het achtervoegsel (1) mist. De
// twee losgelaten formulieren die 25 mm wél kennen noemen weer andere bedragen.
// De doekprijzen zijn het rustige geval: 73 en 77 zijn het eens en de calculator
// volgt ze, alleen ontbreekt de goedkeuring.
const ZONDER_BRON = [
  { sleutel: 'wf_25_alu', in73: 20, in77: 13, gebruikt: 20.85 },
  { sleutel: 'wf_25_zwart', in73: 23, in77: 16, gebruikt: 24.50 },
  { sleutel: 'wf_25_wit', in73: 23, in77: 16, gebruikt: 24.50 },
  { sleutel: 'wf_muurbevestiging', in73: 14.87, in77: 14.87, gebruikt: 14.87 },
  { sleutel: 'doek_eco', in73: 20.27, in77: 20.27, gebruikt: 20.27 },
  { sleutel: 'doek_samba', in73: 29.95, in77: 29.95, gebruikt: 29.95 },
  { sleutel: 'doek_lightex', in73: 27.75, in77: 27.75, gebruikt: 27.75 },
  { sleutel: 'doek_satijn', in73: 31.16, in77: 31.16, gebruikt: 31.16 },
  { sleutel: 'doek_theater', in73: 34.79, in77: 34.79, gebruikt: 34.79 },
];

describe('wand textielframe — sleutels zonder goedgekeurde bron', () => {
  it.each(ZONDER_BRON)(
    '$sleutel — 73 zegt € $in73, 77 zegt € $in77, de calculator rekent met € $gebruikt',
    ({ sleutel, in73, in77, gebruikt }) => {
      expect(bedragVoor(BRON, sleutel)).toBeNull();
      expect(bedragVoor(WF_60, sleutel)).toBe(in73);
      expect(bedragVoor(WF_63, sleutel)).toBe(in77);
      expect(DEFAULTS[sleutel]).toBe(gebruikt);
    },
  );
});
