// Toegang tot de Gravity Forms-export.
//
// De export is de bron van waarheid voor prijzen en formules. Alleen
// formulieren waarvan de naam eindigt op "(1)" gelden als goedgekeurd; de rest
// zijn oude of half afgemaakte varianten en blijven hier buiten beeld.
//
// Vorm van de export: een object met de sleutels '0' t/m '70' plus 'version'.
// Tarieven staan in verborgen velden als `defaultValue`, wisselend met een
// komma of een punt als decimaalteken. Formules staan als `calculationFormula`
// op velden van het type 'product' (het eindbedrag) of 'number' (hulpvelden
// zoals Omtrek en Oppervlakte).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const BRON_PAD = resolve(here, '../../source/gravityforms-export-2026-03-26.json');

const EXPORT = JSON.parse(readFileSync(BRON_PAD, 'utf8'));

// Zet een `defaultValue` of keuzewaarde om naar een getal. Geeft null terug bij
// een lege of niet-numerieke waarde, zodat de aanroeper "ontbreekt" kan
// onderscheiden van "nul".
export function getal(waarde) {
  if (waarde === null || waarde === undefined) return null;
  const tekst = String(waarde).trim().replace(',', '.');
  if (tekst === '') return null;
  const n = Number(tekst);
  return Number.isNaN(n) ? null : n;
}

export function formulier(index) {
  const f = EXPORT[String(index)];
  if (!f) throw new Error(`Geen formulier met index ${index} in de export`);
  return { index: Number(index), id: f.id, titel: f.title, velden: f.fields ?? [] };
}

// Formulieren waarvan de naam eindigt op "(1)".
export function geldigeFormulieren() {
  return Object.keys(EXPORT)
    .filter(sleutel => /^\d+$/.test(sleutel))
    .map(sleutel => formulier(sleutel))
    .filter(form => form.titel.trim().endsWith('(1)'));
}

export function veld(form, id) {
  return form.velden.find(f => String(f.id) === String(id)) ?? null;
}

export function label(form, id) {
  return veld(form, id)?.label ?? null;
}

// Het tarief uit een verborgen veld. Bestaat het veld niet, dan null.
export function tarief(form, id) {
  const f = veld(form, id);
  return f ? getal(f.defaultValue) : null;
}

export function keuzes(form, id) {
  const f = veld(form, id);
  if (!f?.choices) return [];
  return f.choices.map(c => ({ tekst: c.text, waarde: c.value, prijs: c.price }));
}

// Velden die het eindbedrag van een variant berekenen.
export function productVelden(form) {
  return form.velden.filter(f => f.type === 'product' && f.calculationFormula);
}

// Hulpvelden (Omtrek, Oppervlakte) die zelf een formule dragen.
export function rekenVelden(form) {
  return form.velden.filter(f => f.type === 'number' && f.calculationFormula);
}

// De conditional logic van een productveld als { veldId: verwachteWaarde }.
// Alle voorkomens in de geldige formulieren gebruiken logicType 'all' met
// operator 'is', dus een plat object volstaat.
export function conditie(productVeld) {
  const regels = productVeld.conditionalLogic?.rules ?? [];
  const uit = {};
  for (const regel of regels) uit[String(regel.fieldId)] = regel.value;
  return uit;
}
