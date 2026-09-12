// Invoercombinaties per product.
//
// De keuzelijsten worden uit index.html gelezen in plaats van overgetypt, zodat
// een nieuwe optie automatisch meegenomen wordt in de vergelijking met v4.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { BV_SIZES } from '../../src/pricing/beachvlag.js';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, '../../index.html'), 'utf8');

export function optionsOf(selectId) {
  const select = new RegExp(`<select[^>]*id="${selectId}"[^>]*>([\\s\\S]*?)</select>`).exec(html);
  if (!select) throw new Error(`Geen <select id="${selectId}"> gevonden in index.html`);
  const values = [...select[1].matchAll(/value="([^"]*)"/g)].map(m => m[1]);
  if (!values.length) throw new Error(`<select id="${selectId}"> heeft geen opties`);
  return values;
}

// Afmetingparen, inclusief de randgevallen die de lege toestand oproepen
// (0 en een leeg veld) en een waarde met decimalen.
export const SIZES = [
  ['', ''],
  ['0', '100'],
  ['100', '0'],
  ['1', '1'],
  ['100', '200'],
  ['137.5', '42.7'],
  ['9999', '9999'],
];

export const AANTALLEN = ['', '0', '1', '2', '2.5', '17'];

// Cartesisch product van de meegegeven lijsten.
export function combine(...lists) {
  return lists.reduce((acc, list) => acc.flatMap(a => list.map(b => [...a, b])), [[]]);
}

export { BV_SIZES };
