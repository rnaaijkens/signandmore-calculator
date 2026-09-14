// Formules van het wand textielframe, getoetst aan één goedgekeurd formulier:
//
//   index 54 / id 67 — "Wand textielframes (1)"
//
// De drie andere goedgekeurde wandframe-formulieren zijn op verzoek van de
// klant geen meetlat meer: index 58 / id 71, index 60 / id 73 en index 63 / id
// 77. Hun eigen gebreken — verwijzingen naar velden die er niet zijn,
// berekeningen voor keuzes die niet in de keuzelijst staan — staan beschreven in
// docs/openstaande-prijsvragen.md en worden hier niet meer nagerekend. Wat wél
// blijft staan zijn de bedragen waarin ze 67 tegenspreken; die staan onderaan,
// letterlijk uitgeschreven.
//
// Drie soorten blokken voor formulier 67:
//   bron        — wat er in het formulier zelf niet klopt.
//   formulevorm — bron en calculator rekenen met dezelfde tarieven uit de
//                 export; een verschil zit dan in de opbouw van de berekening.
//   eindbedrag  — de calculator rekent met zijn eigen prijstabel.
//
// Formulier 67 verwijst naar een doekprijs, een muurbevestiging en een pees die
// in dát formulier ontbreken. Gravity Forms rekent zo'n verwijzing als 0; dat
// doen wij ook. Zijn formules kennen daarnaast een akoestiekterm die de
// calculator helemaal niet heeft.

import { describe, it, expect } from 'vitest';
import { formulier, veld, tarief, productVelden, rekenVelden, keuzes, conditie } from './helpers/gf-bron.js';
import { evalFormule, prijstabelUit, ontbrekendeVerwijzingen, verwijzingen } from './helpers/gf-formule.js';
import { WF_54, WF_58, WF_60, WF_63, MATEN } from './helpers/woordenboek.js';
import { priceWandframe } from '../src/pricing/wandframe.js';
import { DEFAULTS } from '../src/pricing/defaults.js';

const BRON = WF_54;

function keuzeBestaat(form, veldId, waarde) {
  return keuzes(form, veldId).some(k => k.waarde === waarde);
}

// De dikte, kleur en doekkeuze waar de conditional logic van een productveld op
// staat, vertaald naar de taal van de calculator.
function variantVan(bron, productVeld) {
  const cond = conditie(productVeld);
  const stuur = bron.stuurvelden;
  return {
    dikte: stuur.dikte ? bron.dikte[cond[stuur.dikte]] : bron.vasteDikte,
    kleur: bron.kleur[cond[stuur.kleur]],
    doek: stuur.doek ? bron.doek[cond[stuur.doek]] : 'geen',
  };
}

const form = formulier(BRON.index);
const UIT_BRON = prijstabelUit(form, BRON.tarieven);

const gevallen = [];
const onbereikbaar = [];

for (const productVeld of productVelden(form)) {
  const cond = conditie(productVeld);

  // Een conditie die naar een niet-bestaande keuze verwijst maakt de
  // berekening onbereikbaar; die hoort in het bron-blok, niet hier.
  const stuurt = Object.entries(BRON.stuurvelden).filter(([, veldId]) => veldId);
  const dood = stuurt.filter(([, veldId]) => !keuzeBestaat(form, veldId, cond[veldId]));
  if (dood.length) {
    onbereikbaar.push({
      id: String(productVeld.id),
      omschrijving: productVeld.label,
      keuzes: dood.map(([, veldId]) => `veld ${veldId} = "${cond[veldId]}"`).join(', '),
    });
    continue;
  }

  const { dikte, kleur, doek } = variantVan(BRON, productVeld);

  for (const akoestiek of BRON.akoestiek ? ['0', '1'] : [null]) {
    for (const [breedte, hoogte] of MATEN) {
      const invoer = { [BRON.breedte]: breedte, [BRON.hoogte]: hoogte };
      if (akoestiek !== null) invoer[BRON.akoestiek] = Number(akoestiek);
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

describe(`wand textielframe — bron "${form.titel}" (id ${form.id})`, () => {
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
    const invoer = { [BRON.breedte]: breedte, [BRON.hoogte]: hoogte };
    const uitBron = evalFormule(form, omtrek.calculationFormula, invoer);
    expect(priceWandframe({ ...basis, breedte, hoogte }, DEFAULTS).omtrek).toBe(uitBron);
  });

  it.each(MATEN)('oppervlakte bij %s×%s cm', (breedte, hoogte) => {
    const invoer = { [BRON.breedte]: breedte, [BRON.hoogte]: hoogte };
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

// ---------------------------------------------------------------------------
// Tegenspraak: wat de losgelaten formulieren voor dezelfde variant uitrekenen
// ---------------------------------------------------------------------------

// Het productveld van een variant opzoeken via de conditional logic, zodat de
// veld-id's niet per formulier hoeven te worden overgeschreven.
function productVeldVoor(bron, gezocht) {
  const f = formulier(bron.index);
  return productVelden(f).find(pv => {
    const variant = variantVan(bron, pv);
    return variant.dikte === gezocht.dikte
      && variant.kleur === gezocht.kleur
      && variant.doek === 'geen';
  }) ?? null;
}

// Het eindbedrag dat een formulier voor een variant uitrekent bij 100 × 200 cm,
// zonder doek en met akoestiek uit.
function bedragVan(bron, gezocht) {
  const f = formulier(bron.index);
  const productVeld = productVeldVoor(bron, gezocht);
  if (!productVeld) return null;
  const invoer = { [bron.breedte]: 100, [bron.hoogte]: 200 };
  if (bron.akoestiek) invoer[bron.akoestiek] = 0;
  return evalFormule(f, productVeld.calculationFormula, invoer);
}

// Eén maat volstaat om de tegenspraak vast te leggen: de formulieren verschillen
// in het tarief per meter, dus het verschil schaalt mee met de omtrek. Een
// streepje betekent dat het formulier die variant niet aanbiedt.
const EINDBEDRAGEN = [
  { variant: '19mm alu', dikte: '19', kleur: 'alu', in67: 85.57, in71: 85.57, in73: 106.44, in77: 100.44 },
  { variant: '19mm zwart', dikte: '19', kleur: 'zwart', in67: 99.67, in71: 99.67, in73: 118.44, in77: 118.44 },
  { variant: '19mm wit', dikte: '19', kleur: 'wit', in67: 99.67, in71: 99.67, in73: 118.44, in77: 118.44 },
  { variant: '27mm alu', dikte: '27', kleur: 'alu', in67: 150.67, in71: null, in73: 160.44, in77: 166.44 },
  { variant: '27mm zwart', dikte: '27', kleur: 'zwart', in67: 172.57, in71: null, in73: 181.86, in77: 181.44 },
  { variant: '27mm wit', dikte: '27', kleur: 'wit', in67: 172.57, in71: null, in73: 181.86, in77: 181.44 },
];

describe('wand textielframe — tegenspraak met formulier 67', () => {
  it.each(EINDBEDRAGEN)(
    '$variant bij 100 × 200 cm — 67: € $in67, 71: € $in71, 73: € $in73, 77: € $in77',
    (rij) => {
      expect(bedragVan(BRON, rij)).toBeCloseTo(rij.in67, 9);

      for (const [bron, verwacht] of [[WF_58, rij.in71], [WF_60, rij.in73], [WF_63, rij.in77]]) {
        if (verwacht === null) {
          expect(productVeldVoor(bron, rij)).toBeNull();
        } else {
          expect(bedragVan(bron, rij)).toBeCloseTo(verwacht, 9);
        }
      }
    },
  );

  it('de calculator vult een muurbevestiging in die in 67 alleen als verwijzing bestaat', () => {
    const uitBron = bedragVan(BRON, { dikte: '19', kleur: 'alu' });
    const uitCalculator = priceWandframe(
      { breedte: 100, hoogte: 200, dikte: '19', kleur: 'alu', doek: 'geen' },
      DEFAULTS,
    ).total;

    expect(uitBron).toBeCloseTo(85.57, 9);
    expect(uitCalculator).toBeCloseTo(100.44, 9);
    expect(uitCalculator - uitBron).toBeCloseTo(DEFAULTS.wf_muurbevestiging, 9);

    // De formule van 67 vraagt er wel degelijk om — ze verwijst naar veld 9,
    // "muurbevestiging" — maar dat veld staat niet in het formulier, dus Gravity
    // Forms rekent het als 0. Het bedrag van € 14,87 komt uit 73 en 77. De
    // calculator volgt daarmee de vorm van de losgelaten formulieren en de
    // tarieven van 67.
    const formule = productVeldVoor(BRON, { dikte: '19', kleur: 'alu' }).calculationFormula;
    expect(verwijzingen(formule)).toContain('9');
    expect(veld(form, '9')).toBeNull();
    expect(bedragVan(WF_63, { dikte: '19', kleur: 'alu' })).toBeCloseTo(uitCalculator, 9);
  });
});

// ---------------------------------------------------------------------------
// Bron-controles op de losgelaten formulieren
// ---------------------------------------------------------------------------
//
// 71, 73 en 77 meten de calculator niet meer. Ze zijn wél het enige wat er is
// over de tien sleutels waarvoor 67 geen bron is: de drie 25 mm-tarieven, de
// muurbevestiging, de pees en de vijf doekprijzen. Neemt de klant straks een van
// die bedragen over, dan neemt hij het over uit een van deze formulieren — en
// dan hoort erbij in welke staat dat formulier verkeert.
//
// Deze blokken zijn daarom notulen, geen eisen. Ze staan groen zolang de export
// onveranderd blijft; verandert er iets aan de gebreken, dan worden ze rood en
// is er iets te melden aan de klant.

const ZONDER_BRON_IN_67 = [
  'doek_eco', 'doek_lightex', 'doek_samba', 'doek_satijn', 'doek_theater',
  'wf_25_alu', 'wf_25_wit', 'wf_25_zwart',
  'wf_muurbevestiging', 'wf_pees',
];

// Wat een formulier over zijn eigen berekeningen prijsgeeft: verwijzingen naar
// velden die er niet zijn, berekeningen voor een keuze die niet in de keuzelijst
// staat, en tarieven die niet bij de variant horen.
function bronBevindingen(bron) {
  const f = formulier(bron.index);
  const stuurt = Object.entries(bron.stuurvelden).filter(([, veldId]) => veldId);

  const ontbrekend = {};
  const onbereikbaar = [];
  const verkeerdTarief = [];

  for (const productVeld of productVelden(f)) {
    const ontbreekt = ontbrekendeVerwijzingen(f, productVeld.calculationFormula);
    if (ontbreekt.length) ontbrekend[productVeld.label] = ontbreekt;

    const cond = conditie(productVeld);
    const dood = stuurt.filter(([, veldId]) => !keuzeBestaat(f, veldId, cond[veldId]));
    if (dood.length) {
      onbereikbaar.push({
        id: String(productVeld.id),
        omschrijving: productVeld.label,
        keuzes: dood.map(([, veldId]) => `veld ${veldId} = "${cond[veldId]}"`).join(', '),
      });
      continue;
    }

    // Welke prijssleutels de formule daadwerkelijk aanhaalt, tegenover de
    // sleutels die bij de variant van dit veld horen.
    const { dikte, kleur, doek } = variantVan(bron, productVeld);
    const gebruikt = verwijzingen(productVeld.calculationFormula)
      .map(id => bron.tarieven[id])
      .filter(Boolean);

    for (const verwacht of [`wf_${dikte}_${kleur}`, doek === 'geen' ? null : `doek_${doek}`]) {
      if (!verwacht || gebruikt.includes(verwacht)) continue;
      const zelfdeSoort = verwacht.startsWith('doek_')
        ? s => s.startsWith('doek_')
        : s => /^wf_\d+_/.test(s);
      verkeerdTarief.push({
        id: String(productVeld.id),
        variant: `${dikte}mm ${kleur}, doek ${doek}`,
        verwacht,
        gebruikt: gebruikt.filter(zelfdeSoort),
      });
    }
  }

  return { ontbrekend, onbereikbaar, verkeerdTarief };
}

describe('wand textielframe — bron "Wand textielframe 19mm (1)" (id 71)', () => {
  const bevinding = bronBevindingen(WF_58);
  const f = formulier(WF_58.index);

  it('verwijst in elke berekening naar een doek, een pees en een muurbevestiging die het formulier niet heeft', () => {
    expect(bevinding.ontbrekend).toEqual({
      'Uw 19mm textiel frame aluminium kleur': ['11', '8', '9'],
      'Uw 19mm textiel frame Mat zwart': ['11', '8', '9'],
      'Uw 19mm textiel frame Wit': ['11', '8', '9'],
    });

    // Veld 11 is de pees, 8 het bedrukte peesdoek en 9 de muurbevestiging —
    // in 73 bestaan ze wel. Gravity Forms rekent ze hier als 0, dus die drie
    // kosten vallen uit het totaal.
    for (const id of ['8', '9', '11']) expect(veld(f, id)).toBeNull();
  });

  it('kent een pees van € 3,91 waar geen enkele formule naar verwijst', () => {
    expect(tarief(f, 82)).toBe(3.91);

    const aangehaald = new Set(productVelden(f).flatMap(pv => verwijzingen(pv.calculationFormula)));
    expect(aangehaald.has('82')).toBe(false);

    // Dit is de € 3,91 waar de calculator mee rekent: het enige goedgekeurde
    // voorkomen van die prijs is een veld dat in zijn eigen formulier dood ligt.
    expect(DEFAULTS.wf_pees).toBe(3.91);
  });

  it('heeft verder geen onbereikbare berekeningen en overal het juiste tarief', () => {
    expect(bevinding.onbereikbaar).toEqual([]);
    expect(bevinding.verkeerdTarief).toEqual([]);
  });
});

describe('wand textielframe — bron "Wand textielframe inclusief ful color bedrukt peesdoek (1)" (id 73)', () => {
  const bevinding = bronBevindingen(WF_60);

  it('verwijst alleen naar velden die bestaan en heeft geen onbereikbare berekeningen', () => {
    expect(bevinding.ontbrekend).toEqual({});
    expect(bevinding.onbereikbaar).toEqual([]);
  });

  it('rekent 25 mm zwart met ecodisplay af tegen de 27 mm-prijs', () => {
    expect(bevinding.verkeerdTarief).toEqual([
      {
        id: '134',
        variant: '25mm zwart, doek eco',
        verwacht: 'wf_25_zwart',
        gebruikt: ['wf_27_zwart'],
      },
    ]);

    // € 24,57 in plaats van € 23,00: € 1,57 per meter omtrek te veel.
    expect(tarief(formulier(WF_60.index), 37)).toBe(24.57);
    expect(tarief(formulier(WF_60.index), 38)).toBe(23);
  });
});

describe('wand textielframe — bron "Wandframe plus Doek (1)" (id 77)', () => {
  const bevinding = bronBevindingen(WF_63);
  const f = formulier(WF_63.index);

  it('verwijst alleen naar velden die bestaan en heeft geen onbereikbare berekeningen', () => {
    expect(bevinding.ontbrekend).toEqual({});
    expect(bevinding.onbereikbaar).toEqual([]);
  });

  it('haalt bij 25 mm wit de prijs van 25 mm zwart op en bij theaterdoek die van Lightex', () => {
    expect(bevinding.verkeerdTarief).toEqual([
      {
        id: '43',
        variant: '25mm wit, doek geen',
        verwacht: 'wf_25_wit',
        gebruikt: ['wf_25_zwart'],
      },
      {
        id: '73',
        variant: '25mm zwart, doek theater',
        verwacht: 'doek_theater',
        gebruikt: ['doek_lightex'],
      },
    ]);

    // 25 mm wit en zwart staan hier allebei op € 16,00, dus de eerste fout kost
    // vandaag niets — tot iemand een van de twee wijzigt.
    expect(tarief(f, 37)).toBe(16);
    expect(tarief(f, 35)).toBe(16);

    // De tweede kost wel: € 27,75 in plaats van € 34,79 per m².
    expect(tarief(f, 4)).toBe(27.75);
    expect(tarief(f, 3)).toBe(34.79);
  });
});

describe('wand textielframe — bron van de losgelaten formulieren, samengevat', () => {
  it('elk verkeerd tarief raakt een sleutel waarvoor 67 geen bron is', () => {
    const geraakt = [WF_58, WF_60, WF_63]
      .flatMap(bron => bronBevindingen(bron).verkeerdTarief.map(v => v.verwacht));

    expect([...new Set(geraakt)].sort()).toEqual(['doek_theater', 'wf_25_wit', 'wf_25_zwart']);
    for (const sleutel of geraakt) expect(ZONDER_BRON_IN_67).toContain(sleutel);
  });

  it('alleen 71 mist velden; 73 en 77 zijn structureel heel', () => {
    expect(Object.keys(bronBevindingen(WF_58).ontbrekend)).toHaveLength(3);
    expect(bronBevindingen(WF_60).ontbrekend).toEqual({});
    expect(bronBevindingen(WF_63).ontbrekend).toEqual({});
  });
});
