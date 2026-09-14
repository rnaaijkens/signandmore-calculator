// De vertaalslag tussen de export en de calculator.
//
// De export en `src/pricing/` spreken niet dezelfde taal: de export kent
// veld-id's en keuzeteksten, de calculator prijssleutels en optiewaarden uit
// index.html. Die koppeling staat hier expliciet, per formulier, zodat bij een
// rode test na te gaan is of het verschil in de prijs zit of in de vertaling.
//
// Schrijffouten in de export zijn met opzet letterlijk overgenomen
// ('Aliuminium', 'Theather', 'Strutex'): het zijn sleutels, geen tekst.

// ---------------------------------------------------------------------------
// Vrijstaand textielframe — formulier 7
// ---------------------------------------------------------------------------

export const VR = {
  index: 7,
  breedte: 16,
  hoogte: 17,
  akoestiek: 27,
  bevestiging: 52,
  // Veld-id -> prijssleutel. Hangend en grondplaten ontbreken hier bewust:
  // die bedragen staan niet in een verborgen veld maar in de `value` van de
  // keuzes van veld 52, en worden via BEVESTIGING ingelezen.
  tarieven: {
    55: 'vr_44_alu', 7: 'vr_44_zwart', 56: 'vr_44_wit',
    57: 'vr_80_alu', 38: 'vr_80_zwart', 58: 'vr_80_wit',
    10: 'vr_hoeken', 8: 'vr_peesdoek', 11: 'vr_pees',
    40: 'vr_akoestiek_44', 46: 'vr_akoestiek_80',
  },
  dikte: { '44 mm': '44', '80 mm': '80' },
  kleur: { 'Aluminium (meest gekozen)': 'alu', 'Mat zwart': 'zwart', 'Wit': 'wit' },
  // Keuzewaarde van veld 52 -> optiewaarde van #vr-bevestiging + prijssleutel.
  bevestigingKeuzes: {
    '12,14': { optie: 'hangend', sleutel: 'vr_hangend' },
    '48,83': { optie: 'vrijstaand', sleutel: 'vr_grondplaten' },
  },
};

// ---------------------------------------------------------------------------
// Peesdoek — formulieren 9 en 57
// ---------------------------------------------------------------------------

// Formulier 9 kent geen levertijden; alles is de 5-werkdagenprijs.
export const PD_9 = {
  index: 9,
  breedte: 7,
  hoogte: 8,
  tarieven: {
    6: 'pd_pees',
    1: 'pd_eco_5', 3: 'pd_samba_5', 4: 'pd_lightex_5',
    2: 'pd_satijn_5', 5: 'pd_theater_5',
  },
  // Keuzetekst van veld 9 -> waarde van #pd-doek.
  doek: {
    'Eco display (standaard voor onverlicht frame)': 'eco',
    'Samba voor LED-frame 190grs/m²': 'samba',
    'Lightex voor LED-frame 260grs/m²': 'lightex',
    'Satijn(standaard voor onverlicht frame)': 'satijn',
    'Theather blockout': 'theater',
  },
};

// Formulier 57 splitst de keuze over materiaal (veld 50 of 51) en levertijd
// (veld 52). Samen vormen die de waarde van #pd-doek: 'satijn' + '4'.
export const PD_57 = {
  index: 57,
  breedte: 7,
  hoogte: 8,
  tarieven: {
    6: 'pd_pees',
    1: 'pd_eco_5', 24: 'pd_eco_4', 25: 'pd_eco_3',
    3: 'pd_samba_5', 29: 'pd_samba_4', 28: 'pd_samba_3',
    4: 'pd_lightex_5', 31: 'pd_lightex_4', 30: 'pd_lightex_3',
    2: 'pd_satijn_5', 27: 'pd_satijn_4', 26: 'pd_satijn_3',
    5: 'pd_theater_5', 33: 'pd_theater_4', 32: 'pd_theater_3',
  },
  // De export noemt het doek 'Dekostof' en 'Structex'; de calculator kent ze
  // als 'eco' en 'satijn'. De tarieven maken duidelijk dat het om hetzelfde
  // materiaal gaat.
  materiaal: {
    'Dekostof (meest gebruikt)': 'eco',
    'Structex': 'satijn',
    'Theater': 'theater',
    'Samba backlit': 'samba',
    'Lightex': 'lightex',
  },
  levertijd: { '5 werkdagen': '', '4 werkdagen': '4', '3 werkdagen': '3' },
};

// ---------------------------------------------------------------------------
// Wand textielframe — formulieren 54, 58, 60 en 63
// ---------------------------------------------------------------------------

const WF_DOEK_LANG = {
  'Zonder doek': 'geen',
  'Ecodisplay (voor onverlicht frame)': 'eco',
  'Samba voor LED Frame 190grs/m²': 'samba',
  'Lightex voor LED frame 260grs/m²': 'lightex',
  'satijn 140 grs/m²': 'satijn',
  'Theather blockout': 'theater',
};

export const WF_54 = {
  index: 54,
  breedte: 16,
  hoogte: 17,
  akoestiek: 27,
  // Op welke velden de conditional logic van een productveld stuurt.
  stuurvelden: { dikte: '47', kleur: '59', doek: null },
  // Dit formulier kent geen 25 mm-tarieven, geen pees, geen muurbevestiging en
  // geen doekprijs; die sleutels ontbreken daarom in de tabel.
  tarieven: {
    49: 'wf_19_alu', 7: 'wf_19_zwart', 52: 'wf_19_wit',
    51: 'wf_27_alu', 37: 'wf_27_zwart', 54: 'wf_27_wit',
    10: 'wf_hoeken',
  },
  dikte: { '19 mm': '19', '25 mm': '25', '27 mm': '27' },
  kleur: { 'Aliuminium (meest gekozen)': 'alu', 'mat zwart': 'zwart', 'Wit': 'wit' },
  doek: null, // geen doekkeuze in dit formulier
};

export const WF_58 = {
  index: 58,
  breedte: 16,
  hoogte: 17,
  akoestiek: 27,
  // Dit formulier gaat alleen over 19 mm; er is geen framekeuze.
  stuurvelden: { dikte: null, kleur: '70', doek: null },
  vasteDikte: '19',
  tarieven: {
    49: 'wf_19_alu', 7: 'wf_19_zwart', 52: 'wf_19_wit',
    10: 'wf_hoeken', 82: 'wf_pees',
  },
  dikte: null, // alleen 19 mm, niet als keuze aanwezig
  kleur: { 'Aluminium kleur (zilver)': 'alu', 'Zwart': 'zwart', 'wit': 'wit' },
  doek: null,
};

export const WF_60 = {
  index: 60,
  breedte: 16,
  hoogte: 17,
  akoestiek: null,
  stuurvelden: { dikte: '47', kleur: '59', doek: '81' },
  tarieven: {
    49: 'wf_19_alu', 7: 'wf_19_zwart', 52: 'wf_19_wit',
    50: 'wf_25_alu', 38: 'wf_25_zwart', 53: 'wf_25_wit',
    51: 'wf_27_alu', 37: 'wf_27_zwart', 54: 'wf_27_wit',
    9: 'wf_muurbevestiging', 10: 'wf_hoeken', 11: 'wf_pees',
    76: 'doek_eco', 78: 'doek_samba', 77: 'doek_lightex',
    79: 'doek_satijn', 80: 'doek_theater',
  },
  dikte: { '19 mm': '19', '25 mm': '25', '27 mm': '27' },
  kleur: { 'Aliuminium (meest gekozen)': 'alu', 'mat zwart': 'zwart', 'Wit': 'wit' },
  doek: WF_DOEK_LANG,
};

export const WF_63 = {
  index: 63,
  breedte: 14,
  hoogte: 15,
  akoestiek: null,
  stuurvelden: { dikte: '29', kleur: '30', doek: '31' },
  tarieven: {
    8: 'wf_19_alu', 7: 'wf_19_zwart', 9: 'wf_19_wit',
    33: 'wf_25_alu', 35: 'wf_25_zwart', 37: 'wf_25_wit',
    32: 'wf_27_alu', 34: 'wf_27_zwart', 36: 'wf_27_wit',
    10: 'wf_muurbevestiging', 11: 'wf_hoeken', 13: 'wf_pees',
    1: 'doek_eco', 5: 'doek_samba', 4: 'doek_lightex',
    6: 'doek_satijn', 3: 'doek_theater',
  },
  dikte: { '19mm': '19', '25mm': '25', '27mm': '27' },
  kleur: { 'Aluminium kleur': 'alu', 'Zwart': 'zwart', 'Wit': 'wit' },
  // Samba en Lightex staan wel als tarief in het formulier maar niet in de
  // keuzelijst; de calculator biedt ze wel aan.
  doek: {
    'Zonder doek': 'geen',
    'Ecodisplay (meest gekozen)': 'eco',
    'satijn 140 grs/m²': 'satijn',
    'Theather blockout': 'theater',
  },
};

export const WANDFRAME_BRONNEN = [WF_54, WF_58, WF_60, WF_63];
export const PEESDOEK_BRONNEN = [PD_9, PD_57];

// De afmetingen waarop elke formule wordt nagerekend: een ronde maat, een maat
// met decimalen en de kleinst mogelijke.
export const MATEN = [[100, 200], [137.5, 42.7], [1, 1]];
