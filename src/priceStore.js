import { DEFAULTS } from './pricing/defaults.js';

const STORAGE_KEY = 'signandmore_prices';

// De actieve prijstabel. Losse module-state, gelijk aan `let prices` in v4
// (regel 904): aangepaste prijzen gelden meteen voor alle berekeningen.
let prices = {};

export function getPrices() { return prices; }

export function loadPrices() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    prices = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
  } catch(e) {
    prices = { ...DEFAULTS };
  }
}

export function savePrices() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
    showSaved();
  } catch(e) {}
}

// Zet de tabel terug naar de standaardprijzen en wist de opgeslagen versie.
export function resetToDefaults() {
  prices = { ...DEFAULTS };
  localStorage.removeItem(STORAGE_KEY);
}

export function setPrice(key, val) { prices[key] = val; }

export function showSaved() {
  const ind = document.getElementById('save-indicator');
  ind.classList.add('show');
  setTimeout(() => ind.classList.remove('show'), 1800);
}
