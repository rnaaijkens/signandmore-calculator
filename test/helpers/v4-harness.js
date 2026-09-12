// Draait het script uit dist/signandmore-calculator-v4.html in de DOM-stub.
//
// Er wordt bewust uit het echte referentiebestand gelezen en niet uit een
// kopie: zo kan de meetlat niet stilletjes uit de pas gaan lopen met wat er
// is opgeleverd.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const V4_PATH = resolve(here, '../../dist/signandmore-calculator-v4.html');

const CALCS = [
  'calcWandframe', 'calcPeesdoek', 'calcVrijstaand', 'calcWandLED', 'calcKamerscherm',
  'calcSpandoek', 'calcVlag', 'calcBeachvlag', 'calcSticker', 'calcEtchfolie',
  'bvUpdateSizes', 'loadPrices',
];

export function readV4Source() {
  return readFileSync(V4_PATH, 'utf8');
}

function extractScript(html) {
  const open = html.indexOf('<script>');
  const close = html.lastIndexOf('</script>');
  if (open === -1 || close === -1) throw new Error('Geen <script>-blok gevonden in v4');
  return html.slice(open + '<script>'.length, close);
}

// Levert de calculators van v4 terug, gebonden aan de meegegeven stub.
export function loadV4(dom) {
  const script = extractScript(readV4Source());
  const exposed = [...CALCS, 'DEFAULTS', 'BV_SIZES', 'PRICE_SCHEMA'];
  const factory = new Function(
    'document', 'localStorage', 'window', 'setTimeout', 'confirm',
    `${script}\n;return { ${exposed.join(', ')} };`
  );
  return factory(
    dom.document,
    dom.localStorage,
    { print() {} },
    () => 0,
    () => true
  );
}
