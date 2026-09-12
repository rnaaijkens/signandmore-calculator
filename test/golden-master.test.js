// Golden-master: het gesplitste project moet exact hetzelfde produceren als
// dist/signandmore-calculator-v4.html.
//
// Er wordt niet op totalen vergeleken maar op de volledige innerHTML van het
// resultaatvak. Die bevat het totaal, alle regels van de specificatie, de
// labels, de BTW-regel en de toelichting — één vergelijking dekt dus zowel de
// prijslogica als de opmaak en eventuele floating-point-artefacten.

import { describe, it, expect } from 'vitest';
import { createDom } from './helpers/dom-stub.js';
import { loadV4 } from './helpers/v4-harness.js';
import { optionsOf, SIZES, AANTALLEN, combine, BV_SIZES } from './helpers/grids.js';

// Eén stub voor beide implementaties: ze lezen dezelfde invoervelden, waardoor
// een verschil in testopzet als oorzaak uitgesloten is.
const dom = createDom({ 'bv-type': 'straight' });
globalThis.document = dom.document;
globalThis.localStorage = dom.localStorage;
globalThis.window = { print() {} };

const v4 = loadV4(dom);

const { loadPrices } = await import('../src/priceStore.js');
const { calcWandframe } = await import('../src/products/wandframe.js');
const { calcPeesdoek } = await import('../src/products/peesdoek.js');
const { calcVrijstaand } = await import('../src/products/vrijstaand.js');
const { calcWandLED } = await import('../src/products/wandled.js');
const { calcKamerscherm } = await import('../src/products/kamerscherm.js');
const { calcSpandoek } = await import('../src/products/spandoek.js');
const { calcVlag } = await import('../src/products/vlag.js');
const { calcBeachvlag } = await import('../src/products/beachvlag.js');
const { calcSticker } = await import('../src/products/sticker.js');
const { calcEtchfolie } = await import('../src/products/etchfolie.js');
const { DEFAULTS } = await import('../src/pricing/defaults.js');
const { PRICE_SCHEMA } = await import('../src/priceEditor.js');

loadPrices();

// Draait beide implementaties op dezelfde invoer en eist identieke uitvoer.
function expectSame(resultId, v4Calc, newCalc, values) {
  dom.set(values);

  dom.clear(resultId);
  v4Calc();
  const verwacht = dom.html(resultId);

  dom.clear(resultId);
  newCalc();
  const gekregen = dom.html(resultId);

  expect(gekregen, `invoer: ${JSON.stringify(values)}`).toBe(verwacht);
  return verwacht;
}

// Loopt een raster af en houdt bij hoeveel gevallen een echte prijs opleverden,
// zodat een test die alleen maar lege resultaten vergelijkt niet onopgemerkt
// blijft.
function runGrid(resultId, v4Calc, newCalc, cases) {
  let metPrijs = 0;
  for (const values of cases) {
    const html = expectSame(resultId, v4Calc, newCalc, values);
    if (html.includes('Totaal excl. BTW')) metPrijs++;
  }
  return { totaal: cases.length, metPrijs };
}

function sizeCases(prefix, extra = [[]], keys = []) {
  const cases = [];
  for (const [b, h] of SIZES) {
    for (const combo of extra) {
      const values = { [`${prefix}-breedte`]: b, [`${prefix}-hoogte`]: h };
      keys.forEach((key, i) => { values[key] = combo[i]; });
      cases.push(values);
    }
  }
  return cases;
}

describe('golden master tegen v4', () => {
  it('gebruikt dezelfde standaardprijzen als v4', () => {
    expect(DEFAULTS).toEqual(v4.DEFAULTS);
    expect(Object.keys(DEFAULTS)).toEqual(Object.keys(v4.DEFAULTS));
  });

  it('heeft dezelfde indeling van de prijseditor als v4', () => {
    // De editor bepaalt welke prijzen de klant kan aanpassen; een gemiste of
    // hernoemde sleutel zou stilletjes een prijs onbewerkbaar maken.
    expect(PRICE_SCHEMA).toEqual(v4.PRICE_SCHEMA);
    const sleutels = PRICE_SCHEMA.flatMap(s => s.fields.map(f => f.key));
    expect(sleutels.slice().sort()).toEqual(Object.keys(DEFAULTS).sort());
  });

  it('wand textielframe', () => {
    const cases = sizeCases('wf',
      combine(optionsOf('wf-dikte'), optionsOf('wf-kleur'), optionsOf('wf-doek')),
      ['wf-dikte', 'wf-kleur', 'wf-doek']);
    const { metPrijs } = runGrid('wf-result', v4.calcWandframe, calcWandframe, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('peesdoek', () => {
    const cases = sizeCases('pd', combine(optionsOf('pd-doek')), ['pd-doek']);
    const { metPrijs } = runGrid('pd-result', v4.calcPeesdoek, calcPeesdoek, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('vrijstaand textielframe', () => {
    const cases = sizeCases('vr',
      combine(optionsOf('vr-dikte'), optionsOf('vr-kleur'),
              optionsOf('vr-bevestiging'), optionsOf('vr-akoestiek')),
      ['vr-dikte', 'vr-kleur', 'vr-bevestiging', 'vr-akoestiek']);
    const { metPrijs } = runGrid('vr-result', v4.calcVrijstaand, calcVrijstaand, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('wand LED-frame', () => {
    const cases = sizeCases('wl',
      combine(optionsOf('wl-dikte'), optionsOf('wl-kleur')),
      ['wl-dikte', 'wl-kleur']);
    const { metPrijs } = runGrid('wl-result', v4.calcWandLED, calcWandLED, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('kamerschermen', () => {
    const cases = sizeCases('ks',
      combine(optionsOf('ks-frame'), optionsOf('ks-akoestiek'), AANTALLEN),
      ['ks-frame', 'ks-akoestiek', 'ks-aantal']);
    const { metPrijs } = runGrid('ks-result', v4.calcKamerscherm, calcKamerscherm, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('spandoek', () => {
    const cases = sizeCases('sp',
      combine(optionsOf('sp-materiaal'), optionsOf('sp-levertijd')),
      ['sp-materiaal', 'sp-levertijd']);
    const { metPrijs } = runGrid('sp-result', v4.calcSpandoek, calcSpandoek, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('mastvlag / baniervlag', () => {
    const cases = sizeCases('vl', combine(optionsOf('vl-materiaal')), ['vl-materiaal']);
    const { metPrijs } = runGrid('vl-result', v4.calcVlag, calcVlag, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('beachvlag', () => {
    const cases = [];
    for (const type of optionsOf('bv-type')) {
      for (const afmeting of [...BV_SIZES[type], '']) {
        for (const mast of optionsOf('bv-mast')) {
          for (const aantal of AANTALLEN) {
            cases.push({ 'bv-type': type, 'bv-afmeting': afmeting, 'bv-mast': mast, 'bv-aantal': aantal });
          }
        }
      }
    }
    const { metPrijs } = runGrid('bv-result', v4.calcBeachvlag, calcBeachvlag, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('stickers / folie', () => {
    const cases = sizeCases('st',
      combine(optionsOf('st-materiaal'), optionsOf('st-levertijd')),
      ['st-materiaal', 'st-levertijd']);
    const { metPrijs } = runGrid('st-result', v4.calcSticker, calcSticker, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('etchfolie / raamfolie', () => {
    const cases = sizeCases('ef', combine(optionsOf('ef-levertijd')), ['ef-levertijd']);
    const { metPrijs } = runGrid('ef-result', v4.calcEtchfolie, calcEtchfolie, cases);
    expect(metPrijs).toBeGreaterThan(0);
  });

  it('volgt aangepaste prijzen uit localStorage op dezelfde manier', () => {
    // De prijseditor schrijft naar deze sleutel; beide implementaties moeten er
    // hetzelfde uit afleiden.
    localStorage.setItem('signandmore_prices', JSON.stringify({
      wf_19_alu: 99.99,
      wf_muurbevestiging: 0,
      doek_eco: 1.234,
      sp_bisonyl_5: 7.5,
    }));
    v4.loadPrices();
    loadPrices();

    expectSame('wf-result', v4.calcWandframe, calcWandframe, {
      'wf-breedte': '150', 'wf-hoogte': '250',
      'wf-dikte': '19', 'wf-kleur': 'alu', 'wf-doek': 'eco',
    });
    expectSame('sp-result', v4.calcSpandoek, calcSpandoek, {
      'sp-breedte': '300', 'sp-hoogte': '120',
      'sp-materiaal': 'bisonyl', 'sp-levertijd': '5',
    });

    localStorage.removeItem('signandmore_prices');
    v4.loadPrices();
    loadPrices();
  });
});
