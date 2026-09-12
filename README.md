# Sign and More prijscalculator

Standalone offline prijscalculator voor Sign and More (signandmore.nl).
Vervangt de oorspronkelijke WordPress/Gravity Forms calculators nadat de webshop is gestopt.

## Structuur

- source/ brongegevens van de klant, Gravity Forms JSON export
- dist/ de op te leveren standalone HTML calculator
- docs/ mappingdocument voor controle door de klant

## Uitgangspunten

- Geen framework, geen server, geen build. Een enkel HTML bestand dat lokaal werkt.
- Prijzen zijn aanpasbaar en worden bewaard via localStorage.
- Volledigheid is een harde eis. De klant moet alles zelfstandig kunnen controleren.

## Bron van waarheid

De export bevat dubbele formulieren. Alleen de formulieren met het achtervoegsel (1)
in de formuliernaam zijn geldig. Alle prijzen en formules worden daaruit afgeleid.

## Bekende afwijkingen in v4

- Wand LED-frame ontbreekt volledig in de HTML.
- Kamerschermen: formule wijkt af van de JSON. Omtrekberekening klopt niet,
  aantal schermen ontbreekt en BTW wordt niet verwerkt.
- Peesdoek materiaalkeuze, vijf materialen, ontbreekt op het tabblad wand textielframe.
- Prijs vr_hangend van 12,14 heeft geen herleidbare bron in de JSON.
