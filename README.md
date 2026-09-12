# Sign and More prijscalculator

Standalone offline prijscalculator voor Sign and More (signandmore.nl).
Vervangt de oorspronkelijke WordPress/Gravity Forms calculators nadat de webshop is gestopt.

## Structuur

- source/ brongegevens van de klant, Gravity Forms JSON export
- src/ de broncode: prijslogica in src/pricing/, de interface in src/
- test/ golden-master tests die de broncode tegen v4 leggen
- dist/ de op te leveren standalone HTML calculators
- docs/ mappingdocument voor controle door de klant

## Uitgangspunten

- Geen framework en geen server. Het eindproduct is een enkel HTML bestand dat
  lokaal werkt, zonder internetverbinding en zonder externe bestanden.
- De broncode is wel gesplitst en wordt met Vite gebouwd. vite-plugin-singlefile
  voegt alles weer samen tot dat ene bestand.
- Prijzen zijn aanpasbaar en worden bewaard via localStorage.
- Volledigheid is een harde eis. De klant moet alles zelfstandig kunnen controleren.

## Werken aan de calculator

    npm install
    npm run dev      # ontwikkelserver
    npm test         # golden-master tests tegen v4
    npm run build    # bouwt dist/signandmore-calculator-v5.html

De prijslogica staat per product als pure functie in src/pricing/. Die functies
kennen de DOM niet en geven alleen getallen terug, zodat een formule los te lezen
en te testen is. De bijbehorende adapter in src/products/ leest de invoervelden,
roept de prijsfunctie aan en stelt de omschrijvingen samen.

## Bron van waarheid

De export bevat dubbele formulieren. Alleen de formulieren met het achtervoegsel (1)
in de formuliernaam zijn geldig. Alle prijzen en formules worden daaruit afgeleid.

## v4 als referentie

dist/signandmore-calculator-v4.html blijft ongewijzigd staan. De tests in test/
draaien dat bestand en de nieuwe broncode naast elkaar over ruim 1200
invoercombinaties en eisen exact dezelfde uitvoer, tot en met de opmaak van de
bedragen. Zolang die tests groen zijn rekent v5 identiek aan v4.

## Bekende afwijkingen, overgenomen uit v4

Deze punten zijn bewust ongewijzigd meegenomen bij het splitsen, zodat het
gedrag gelijk bleef. Ze vragen een beslissing van de klant voordat ze worden
gecorrigeerd.

- Kamerschermen: formule wijkt af van de JSON. Omtrekberekening klopt niet en het
  totaal telt niet op tot de getoonde regels, doordat er eenmaal een scharnier
  van af gaat.
- Peesdoek, vrijstaand frame en wand LED-frame delen de doekkosten door 100. De
  overige producten doen dat niet.
- Vrijstaand frame: de regel vermeldt "Pees ×2" maar rekent met één keer de pees.
- Peesdoek materiaalkeuze, vijf materialen, ontbreekt op het tabblad wand textielframe.
- Prijs vr_hangend van 12,14 heeft geen herleidbare bron in de JSON.
