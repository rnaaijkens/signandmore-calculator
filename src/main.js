import './style.css';

import { showTab } from './dom.js';
import { loadPrices } from './priceStore.js';
import { renderPriceEditor, updatePrice, resetPrices } from './priceEditor.js';

import { calcWandframe } from './products/wandframe.js';
import { calcPeesdoek } from './products/peesdoek.js';
import { calcVrijstaand } from './products/vrijstaand.js';
import { calcWandLED } from './products/wandled.js';
import { calcKamerscherm } from './products/kamerscherm.js';
import { calcSpandoek } from './products/spandoek.js';
import { calcVlag } from './products/vlag.js';
import { bvUpdateSizes, calcBeachvlag } from './products/beachvlag.js';
import { calcSticker } from './products/sticker.js';
import { calcEtchfolie } from './products/etchfolie.js';

// De markup gebruikt inline on*-attributen, en die worden tegen `window`
// opgelost. Een module heeft geen globale scope, dus de veertien functies die
// vanuit HTML worden aangeroepen zijn hier expliciet beschikbaar gemaakt.
Object.assign(window, {
  showTab, updatePrice, resetPrices, bvUpdateSizes,
  calcWandframe, calcPeesdoek, calcVrijstaand, calcWandLED, calcKamerscherm,
  calcSpandoek, calcVlag, calcBeachvlag, calcSticker, calcEtchfolie,
});

// Zelfde volgorde als v4 (regels 1276-1278).
loadPrices();
renderPriceEditor();
bvUpdateSizes();
