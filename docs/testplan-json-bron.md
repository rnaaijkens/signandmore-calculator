# Vitest-tests afgeleid van de Gravity Forms-export

## Context

De prijzen en formules in `src/pricing/` zijn overgenomen uit
`dist/signandmore-calculator-v4.html`. De bestaande `test/golden-master.test.js`
bewaakt alleen dát: dat de gesplitste code hetzelfde doet als v4. Er is geen
enkele test die controleert of v4 zelf overeenstemt met de werkelijke bron —
de Gravity Forms-export `source/gravityforms-export-2026-03-26.json`.

Deze wijziging voegt een tweede, onafhankelijke meetlat toe: tests die de
prijzen en formules rechtstreeks uit de JSON afleiden en daarmee de functies in
`src/pricing/` toetsen. De JSON is leidend, niet de bestaande code. `src/` wordt
niet aangepast en falende tests blijven falen — een rode test is hier de
uitkomst, geen defect in de test.

## Wat de bron oplevert

Van de 71 formulieren in de export dragen er **9** het achtervoegsel `(1)`:
indexen 7, 9, 54, 57, 58, 60, 62, 63, 69. Daarvan bevatten 62 (TilburgsAns,
containerstickers) en 69 (V-bord, vaste `basePrice`) geen prijsformules voor een
product uit de calculator. Bruikbaar blijven:

| idx | formulier | product | code |
|-----|-----------|---------|------|
| 7 | Vrijstaande textielframes (1) | vrijstaand frame | `priceVrijstaand` |
| 9 | Peesdoek diverse materialen (1) | peesdoek | `pricePeesdoek` |
| 57 | Peesdoek diverse materialen Deff. (1) | peesdoek | `pricePeesdoek` |
| 54 | Wand textielframes (1) | wandframe | `priceWandframe` |
| 58 | Wand textielframe 19mm (1) | wandframe | `priceWandframe` |
| 60 | Wand textielframe incl. ful color bedrukt peesdoek (1) | wandframe | `priceWandframe` |
| 63 | Wandframe plus Doek (1) | wandframe | `priceWandframe` |

Dat dekt **3 van de 10 producten**. Kamerscherm (`ks_`), spandoek (`sp_`), vlag
(`vl_`), beachvlag (`bv_`), sticker (`st_`), etchfolie (`ef_`) en wand-LED
(`wl_`) hebben géén bronformulier met `(1)` en krijgen dus geen testbestand:
67 van de 113 prijssleutels blijven onafgedekt. Dat is een gevolg van de
geldigheidsregel, niet iets om omheen te werken.

Vorm van de bron: tarieven staan in verborgen velden als `defaultValue`
(komma óf punt als decimaalteken, wisselend per formulier). Formules staan als
`calculationFormula` op `product`-velden met `inputType: "calculation"`, met
merge tags `{Label:veldId}` — alleen het id telt, het label is cosmetisch en
loopt regelmatig achter. Welke formule van toepassing is volgt uit
`conditionalLogic` (`logicType: "all"`) op de keuzevelden. `calculationRounding`
is overal leeg, wat aansluit op de regel dat er nergens in de berekening wordt
afgerond.

## Aanpak

### Locatie en configuratie

Nieuwe map `tests/` naast het bestaande `test/`. `vitest.config.js` krijgt het
tweede patroon erbij; verder blijft die ongewijzigd:

```js
include: ['test/**/*.test.js', 'tests/**/*.test.js'],
```

`test/golden-master.test.js` blijft staan waar het staat. `src/` wordt niet
aangeraakt.

### Helpers

**`tests/helpers/gf-bron.js`** — leest de export één keer en ontsluit hem.

- `geldigeFormulieren()` — formulieren waarvan `title.trim()` eindigt op `(1)`.
- `formulier(index)`, `veld(form, id)`.
- `tarief(form, id)` — `defaultValue` van een hidden veld als getal; vangt zowel
  `20.27` als `77,50` af. Bestaat het veld niet, dan `null` (niet 0) zodat de
  aanroeper het verschil ziet tussen "ontbreekt" en "nul".
- `keuzes(form, id)` — `choices` als `{ text, value, price }`.
- `productVelden(form)` — velden met een `calculationFormula`, inclusief hun
  `conditionalLogic`.
- `rekenVelden(form)` — number-velden met `enableCalculation` (de Omtrek- en
  Oppervlakte-hulpvelden).

**`tests/helpers/gf-formule.js`** — rekent een `calculationFormula` uit zoals
Gravity Forms dat doet.

- `verwijzingen(formule)` — de veld-id's uit alle `{...:id}` merge tags.
- `evalFormule(form, formule, invoer)`:
  - elke merge tag wordt vervangen door een getal: uit `invoer` (Breedte,
    Hoogte, keuzewaarden), anders het tarief van het hidden veld, anders — als
    het veld in dit formulier niet bestaat — **`0`**, wat Gravity Forms zelf ook
    doet;
  - een tag die naar een hulpveld wijst (Omtrek, Oppervlakte) wordt eerst zélf
    uitgerekend tot een getal en dan ingevuld, precies zoals GF dat doet en
    zoals de prijsfuncties `omtrek` en `opp` als losse getallen gebruiken;
  - na substitutie mag er alleen nog `0-9 . + - * / ( )` en witruimte over zijn;
    zo niet, dan gooit de helper. Daarna `new Function('return (…)')()`, zodat
    de operatievolgorde van de bron letterlijk behouden blijft.

**`tests/helpers/woordenboek.js`** — de vertaalslag tussen JSON en code, per
formulier expliciet en met commentaar waarom. Twee tabellen:

- veld-id → prijssleutel, bijv. voor formulier 7:
  `{ 55: 'vr_44_alu', 7: 'vr_44_zwart', 56: 'vr_44_wit', 57: 'vr_80_alu',
  38: 'vr_80_zwart', 58: 'vr_80_wit', 10: 'vr_hoeken', 8: 'vr_peesdoek',
  11: 'vr_pees', 40: 'vr_akoestiek_44', 46: 'vr_akoestiek_80' }`.
  Bij formulier 7 staan `vr_hangend` (12,14) en `vr_grondplaten` (48,83) niet in
  een hidden veld maar in de `value` van de keuzes van veld 52; die uitzondering
  krijgt zijn eigen regel.
- keuzetekst → optiewaarde uit `index.html`, bijv.
  `'Aliuminium (meest gekozen)' → 'alu'`, `'mat zwart' → 'zwart'`,
  `'19 mm' → '19'`, `'Zonder doek' → 'geen'`,
  `'Theather blockout' → 'theater'`. Bij formulier 57 wordt materiaal én
  levertijd samengevoegd tot een `PD_KEY_MAP`-sleutel: `Structex` +
  `4 werkdagen` → `satijn4`.

### Testbestanden

Zes bestanden, elk met een kopcommentaar dat benoemt uit welk formulier de
verwachtingen komen.

```
tests/wandframe.prijzen.test.js    tests/wandframe.formules.test.js
tests/peesdoek.prijzen.test.js     tests/peesdoek.formules.test.js
tests/vrijstaand.prijzen.test.js   tests/vrijstaand.formules.test.js
```

**Prijstests.** Eén `it` per (bronformulier, tarief). Omdat alle `(1)`-formulieren
geldig zijn en ze elkaar tegenspreken, krijgt een sleutel meerdere tests, elk
met het formuliernummer in de naam:

```js
it.each(tarieven)('[form $form] $label → $sleutel = $bedrag', ({ sleutel, bedrag }) => {
  expect(DEFAULTS[sleutel]).toBe(bedrag);
});
```

Vergelijking met `toBe`: tarieven zijn letterlijke getallen, daar hoort geen
tolerantie bij.

**Formuletests.** Eén `it` per `calculationFormula` in de bron, plus één per
hulpveld (Omtrek, Oppervlakte). De invoerkeuzes worden uit de
`conditionalLogic` van dat productveld afgeleid en via het woordenboek omgezet
naar de invoer van de prijsfunctie. Elk bestand heeft twee `describe`-blokken,
zodat een rode test meteen zegt wát er mis is:

- *formulevorm* — JSON-formule mét JSON-tarieven, tegenover de prijsfunctie met
  diezelfde JSON-tarieven als prijstabel. Faalt dit, dan wijkt de **vorm** van
  de berekening af.
- *eindbedrag* — JSON-formule mét JSON-tarieven, tegenover de prijsfunctie met
  `DEFAULTS`. Faalt alleen dit blok, dan klopt de vorm en wijken de **tarieven**
  af.

Afmetingen: `[100, 200]`, `[137.5, 42.7]` en `[1, 1]`. Vergelijking met
`toBeCloseTo(verwacht, 9)` — ruim onder een cent, maar ongevoelig voor de
laatste ULP. Daarnaast per product één losse `it` die op één maat met `toBe`
vergelijkt, zodat bit-verschillen in de operatievolgorde apart zichtbaar worden
in plaats van alles rood te kleuren.

### Wat er naar verwachting rood wordt

Dit hoort zo en mag niet worden weggepoetst.

- **Vrijstaand** — alle 13 tarieven kloppen. De formule in formulier 7 gebruikt
  in álle zes varianten akoestiekfoam 40 mm (`:40`, 115,29), ook bij een 80 mm
  frame; `priceVrijstaand` pakt daar `vr_akoestiek_80` (155,68). De
  80 mm-varianten met akoestiek falen dus. Veld 46 (155,68) staat in het
  formulier maar wordt nergens aangeroepen. Verder telt de bron de doekterm twee
  keer als `opp*peesdoek/100`, waar de code `opp*doekPerM2*2/100` rekent —
  algebraïsch gelijk, kandidaat voor de bit-identiteitstest.
- **Peesdoek** — formulier 57 dekt de volledige levertijdmatrix en klopt op 15
  van de 16 sleutels; `pd_eco_5` is in de bron **22,27** tegen 20,27 in de code.
  Formulier 9 geeft `pd_pees` = **3,81** waar formulier 57 en de code 3,91
  zeggen. De formule `((omtrek*pees + opp*doek)/100)` komt exact overeen met
  `pricePeesdoek`.
- **Wandframe** — de vier bronformulieren zijn het oneens: 19 mm aluminium is
  11 (54, 58, 63) of 12 (60); pees is 3,91 (58) of 3,15 (60, 63). Geen enkel
  `(1)`-formulier bevat de `wf_25_*`-tarieven uit de code (20,85/24,50): 60 zegt
  20/23, 63 zegt 13/16, 54 en 58 kennen 25 mm niet. Formules 60 en 63 bevestigen
  de vorm van `priceWandframe` exact. Formulieren 54 en 58 verwijzen naar
  veld-id's `:8` (peesdoek), `:9` (muurbevestiging) en `:11` (pees) die in dát
  formulier niet bestaan; die worden GF-getrouw als 0 gerekend, waardoor hun
  formuletests falen op het verschil met de code die pees en muurbevestiging wél
  meetelt. Beide formulieren rekenen bovendien een akoestiekterm die
  `priceWandframe` helemaal niet kent; de varianten met akoestiek = 1 falen
  daarop. Een aparte `it` per formulier legt vast wélke verwijzingen ontbreken,
  zodat het defect in de bron benoemd is en niet alleen als afgeleide fout
  opduikt.

## Bestanden

| bestand | wijziging |
|---|---|
| `vitest.config.js` | `include` uitgebreid met `tests/**/*.test.js` |
| `tests/helpers/gf-bron.js` | nieuw |
| `tests/helpers/gf-formule.js` | nieuw |
| `tests/helpers/woordenboek.js` | nieuw |
| `tests/wandframe.prijzen.test.js` | nieuw |
| `tests/wandframe.formules.test.js` | nieuw |
| `tests/peesdoek.prijzen.test.js` | nieuw |
| `tests/peesdoek.formules.test.js` | nieuw |
| `tests/vrijstaand.prijzen.test.js` | nieuw |
| `tests/vrijstaand.formules.test.js` | nieuw |
| `docs/testplan-json-bron.md` | nieuw — kopie van dit plan, zodat het in de VS Code Explorer staat naast `signandmore-volledig-mapping.xlsx` |

Niet aangeraakt: `src/**`, `index.html`, `dist/signandmore-calculator-v4.html`,
`test/**`.

## Controle

1. `npm test` — de nieuwe suite draait mee met de golden master.
2. De 13 bestaande golden-master-tests moeten **groen** blijven. Worden die
   rood, dan raakt de wijziging `src/` of de configuratie op een manier die niet
   de bedoeling is.
3. De nieuwe tests mogen rood zijn. Controleren dat elke rode test een echte
   afwijking tussen JSON en code aanwijst en geen fout in de helper: per rood
   cluster de betreffende `calculationFormula` en de tarieven in de JSON
   naslaan.
4. `npx vitest run tests/vrijstaand.prijzen.test.js` — moet volledig groen zijn;
   alle 13 `vr_`-tarieven komen letterlijk overeen met formulier 7. Is dit rood,
   dan zit de fout in `tarief()` (waarschijnlijk het decimaalteken).
5. `npx vitest run tests/peesdoek.formules.test.js` — de formulevorm-blokken
   moeten groen zijn; alleen `pd_eco_5` en `pd_pees` (formulier 9) horen in het
   eindbedrag-blok te falen.
6. `npm run build` en `dist/signandmore-calculator-v5.html` via `file://` openen
   — de build mag niet veranderd zijn, want `src/` is niet aangeraakt.
