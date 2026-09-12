# CLAUDE.md

Prijscalculator voor Sign and More. Tien producten (frames, doeken, spandoeken,
vlaggen, folie), elk met een eigen tabblad en prijsformule.

## Harde eisen

1. **Het eindproduct is één HTML bestand dat offline werkt.** Geen server, geen
   CDN, geen externe fonts of afbeeldingen. `npm run build` voegt alles samen via
   vite-plugin-singlefile. Voeg nooit een resource toe die over het netwerk wordt
   opgehaald.
2. **`dist/signandmore-calculator-v4.html` wordt nooit gewijzigd.** Dat is de
   referentie waartegen het gedrag wordt gemeten. `emptyOutDir: false` in
   `vite.config.js` is wat voorkomt dat Vite het weggooit — laat die vlag staan.
3. **Prijzen en formules wijzigen alleen op verzoek van de klant.** Ze komen uit
   `source/gravityforms-export-2026-03-26.json`; alleen formulieren met het
   achtervoegsel `(1)` in de naam zijn geldig.

## Opbouw

    src/pricing/     pure functies, één bestand per product
    src/products/    adapters: DOM lezen -> prijsfunctie -> omschrijvingen -> renderResult
    src/             interface: main, style.css, dom, format, result, priceStore, priceEditor
    test/            golden-master tests tegen v4
    index.html       markup, letterlijk overgenomen uit v4

`src/pricing/*` kent de DOM niet, formatteert niets en houdt geen state vast. Een
prijsfunctie krijgt een invoerobject en de prijstabel, en geeft alleen getallen
terug — inclusief tussenresultaten als `omtrek` en `opp`, omdat de adapter die in
de omschrijvingen toont en ze niet zelf mag herberekenen.

Prijzen staan plat in `src/pricing/defaults.js`, met een prefix per product
(`wf_`, `pd_`, `vr_`, `wl_`, `ks_`, `sp_`, `vl_`, `bv_`, `st_`, `ef_`). De klant
kan ze aanpassen in het tabblad ⚙ Prijzen; dat bewaart in localStorage onder
`signandmore_prices`. `PRICE_SCHEMA` in `src/priceEditor.js` bepaalt welke
prijzen bewerkbaar zijn — elke sleutel uit `DEFAULTS` hoort daar precies één keer
in te staan, en een test bewaakt dat.

## Gedrag gelijk houden aan v4

`test/golden-master.test.js` draait het echte v4-bestand en de broncode naast
elkaar over ruim 1200 invoercombinaties, en vergelijkt de volledige `innerHTML`
van het resultaatvak. Dat dekt bedragen, regels, labels, de BTW-regel en
floating-point-artefacten in één vergelijking.

Gevolg: elke wijziging die de uitvoer verandert laat deze tests vallen. Dat is de
bedoeling. Repareer zo'n test niet om hem groen te krijgen — stel eerst vast of
de wijziging gewenst is, en leg dan vast dat v4 op dat punt bewust is losgelaten.

De keuzelijsten in de tests worden uit `index.html` gelezen, dus een nieuwe optie
in een `<select>` wordt automatisch meegenomen.

## Bewust behouden eigenaardigheden

Deze zitten in v4 en zijn onveranderd overgenomen. **Niet stilletjes opschonen**;
het zijn prijsbeslissingen van de klant, geen refactorwerk. Ze staan toegelicht
in `README.md` en in commentaar bij de betreffende functies.

- Peesdoek, vrijstaand frame en wand LED delen de doekkosten door 100; wandframe
  en kamerscherm niet.
- Kamerscherm: het totaal telt niet op tot de getoonde regels.
- Vrijstaand: de regel zegt "Pees ×2" maar rekent met één keer de pees.
- Twee tekstueel verschillende omtrekformules: `(h + b + b + h) / 100` bij
  wf/vr/wl, `(b + h) / 50` bij pd/ks. Laat elke functie zijn eigen expressie
  houden; algebraïsch gelijk is niet hetzelfde als bit-identiek.
- Volgorde van vermenigvuldigingen letterlijk laten staan, om dezelfde reden.
- `p(key)` geeft 0 terug bij een onbekende sleutel in plaats van te klagen.
- Er wordt nergens in de berekening afgerond; `toFixed(2)` gebeurt pas bij
  weergave, en de BTW gaat over het onafgeronde totaal.

## De inline handlers

De markup gebruikt 53 inline `on*=`-attributen plus twee die vanuit JavaScript
worden gegenereerd. Een ES-module heeft geen globale scope, dus `src/main.js`
zet de veertien aangeroepen functies expliciet op `window`. Zet daar een functie
bij zodra je een nieuwe handler in de markup gebruikt.

Het omzetten naar `addEventListener` is bewust uitgesteld: het raakt 55 plekken
en hoort een losse, apart te reviewen wijziging te zijn.

## Commando's

    npm run dev      ontwikkelserver
    npm test         golden-master tests
    npm run build    bouwt dist/signandmore-calculator-v5.html

Voor een echte controle in de browser: `npm run build`, dan het bestand openen
met `file://`. Dat pad moet werken, want zo gebruikt de klant het.

## Stijl

Nederlands in de interface, in identifiers en in commentaar. Twee spaties
inspringen, puntkomma's, enkele quotes. Commitberichten zijn korte Engelse
regels in gebiedende wijs, zonder prefix.
