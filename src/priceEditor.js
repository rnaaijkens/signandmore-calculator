import { getPrices, setPrice, savePrices, resetToDefaults, showSaved } from './priceStore.js';

// Indeling en labels van de prijseditor, overgenomen uit v4 regels 727-901.
export const PRICE_SCHEMA = [
  {
    title: 'Wand textielframe — frame per meter (€/m)',
    fields: [
      { key: 'wf_19_alu',    label: '19mm Aluminium' },
      { key: 'wf_19_zwart',  label: '19mm Mat zwart' },
      { key: 'wf_19_wit',    label: '19mm Wit' },
      { key: 'wf_25_alu',    label: '25mm Aluminium' },
      { key: 'wf_25_zwart',  label: '25mm Mat zwart' },
      { key: 'wf_25_wit',    label: '25mm Wit' },
      { key: 'wf_27_alu',    label: '27mm Aluminium' },
      { key: 'wf_27_zwart',  label: '27mm Mat zwart' },
      { key: 'wf_27_wit',    label: '27mm Wit' },
      { key: 'wf_pees',      label: 'Pees per meter' },
      { key: 'wf_muurbevestiging', label: 'Muurbevestiging (vast)' },
      { key: 'wf_hoeken',    label: '4 hoeken (vast)' },
    ]
  },
  {
    title: 'Doek per m² (voor wand textielframe)',
    fields: [
      { key: 'doek_eco',     label: 'Ecodisplay' },
      { key: 'doek_samba',   label: 'Samba (LED)' },
      { key: 'doek_lightex', label: 'Lightex (LED)' },
      { key: 'doek_satijn',  label: 'Satijn 140 grs/m²' },
      { key: 'doek_theater', label: 'Theater blockout' },
    ]
  },
  {
    title: 'Peesdoek per m² (alle levertijden)',
    fields: [
      { key: 'pd_pees',      label: 'Pees per meter' },
      { key: 'pd_eco_5',     label: 'Eco display 5 wkd' },
      { key: 'pd_eco_4',     label: 'Eco display 4 wkd' },
      { key: 'pd_eco_3',     label: 'Eco display 3 wkd' },
      { key: 'pd_samba_5',   label: 'Samba 5 wkd' },
      { key: 'pd_samba_4',   label: 'Samba 4 wkd' },
      { key: 'pd_samba_3',   label: 'Samba 3 wkd' },
      { key: 'pd_lightex_5', label: 'Lightex 5 wkd' },
      { key: 'pd_lightex_4', label: 'Lightex 4 wkd' },
      { key: 'pd_lightex_3', label: 'Lightex 3 wkd' },
      { key: 'pd_satijn_5',  label: 'Satijn 5 wkd' },
      { key: 'pd_satijn_4',  label: 'Satijn 4 wkd' },
      { key: 'pd_satijn_3',  label: 'Satijn 3 wkd' },
      { key: 'pd_theater_5', label: 'Theater 5 wkd' },
      { key: 'pd_theater_4', label: 'Theater 4 wkd' },
      { key: 'pd_theater_3', label: 'Theater 3 wkd' },
    ]
  },
  {
    title: 'Vrijstaand textielframe — frame per meter (€/m)',
    fields: [
      { key: 'vr_44_alu',    label: '44mm Aluminium' },
      { key: 'vr_44_zwart',  label: '44mm Mat zwart' },
      { key: 'vr_44_wit',    label: '44mm Wit' },
      { key: 'vr_80_alu',    label: '80mm Aluminium' },
      { key: 'vr_80_zwart',  label: '80mm Mat zwart' },
      { key: 'vr_80_wit',    label: '80mm Wit' },
      { key: 'vr_hoeken',    label: '4 hoeken (vast)' },
      { key: 'vr_pees',      label: 'Pees per meter' },
      { key: 'vr_peesdoek',  label: 'Peesdoek per m²' },
      { key: 'vr_hangend',   label: 'Bevestiging: hangend' },
      { key: 'vr_grondplaten', label: 'Bevestiging: grondplaten' },
      { key: 'vr_akoestiek_44', label: 'Akoestiek foam 40mm (per m²)' },
      { key: 'vr_akoestiek_80', label: 'Akoestiek foam 80mm (per m²)' },
    ]
  },
  {
    title: 'Wand LED-frame — per meter (€/m)',
    fields: [
      { key: 'wl_50_alu',    label: '50mm Aluminium' },
      { key: 'wl_50_zwart',  label: '50mm Mat zwart' },
      { key: 'wl_50_wit',    label: '50mm Wit' },
      { key: 'wl_60_alu',    label: '60mm Aluminium' },
      { key: 'wl_60_zwart',  label: '60mm Mat zwart' },
      { key: 'wl_60_wit',    label: '60mm Wit' },
      { key: 'wl_90_alu',    label: '90mm Aluminium' },
      { key: 'wl_90_zwart',  label: '90mm Mat zwart' },
      { key: 'wl_90_wit',    label: '90mm Wit' },
      { key: 'wl_led',       label: 'LED strip per meter' },
      { key: 'wl_pees',      label: 'Pees per meter' },
      { key: 'wl_peesdoek',  label: 'Peesdoek per m²' },
    ]
  },
  {
    title: 'Kamerschermen',
    fields: [
      { key: 'ks_44_frame',    label: '44mm frame per meter' },
      { key: 'ks_80_frame',    label: '80mm frame per meter' },
      { key: 'ks_pees',        label: 'Pees per meter' },
      { key: 'ks_hoeken',      label: '4 hoeken per scherm' },
      { key: 'ks_peesdoek',    label: 'Peesdoek per m²' },
      { key: 'ks_scharnier',   label: 'Scharnier per scherm' },
      { key: 'ks_vloerplaten', label: 'Vloerplaten (basis, vast)' },
      { key: 'ks_akoestiek_44', label: 'Akoestiek foam 40mm (per m²)' },
      { key: 'ks_akoestiek_80', label: 'Akoestiek foam 80mm (per m²)' },
    ]
  },
  {
    title: 'Spandoek per m²',
    fields: [
      { key: 'sp_bisonyl_5',  label: 'Bisonyl 5 werkdagen' },
      { key: 'sp_bisonyl_4',  label: 'Bisonyl 4 werkdagen' },
      { key: 'sp_bisonyl_3',  label: 'Bisonyl 3 werkdagen' },
      { key: 'sp_mesh_5',     label: 'Mesh 5 werkdagen' },
      { key: 'sp_mesh_4',     label: 'Mesh 4 werkdagen' },
      { key: 'sp_mesh_3',     label: 'Mesh 3 werkdagen' },
      { key: 'sp_blockout_5', label: 'Blockout 5 werkdagen' },
      { key: 'sp_blockout_4', label: 'Blockout 4 werkdagen' },
      { key: 'sp_blockout_3', label: 'Blockout 3 werkdagen' },
    ]
  },
  {
    title: 'Mastvlag / Baniervlag per m²',
    fields: [
      { key: 'vl_mast_vlg',    label: 'Mastvlag — Vlaggenstof' },
      { key: 'vl_mast_poly',   label: 'Mastvlag — Polymesh' },
      { key: 'vl_banier_vlg',  label: 'Baniervlag — Vlaggenstof' },
      { key: 'vl_banier_poly', label: 'Baniervlag — Polymesh' },
    ]
  },
  {
    title: 'Beachvlag — prijs per stuk',
    fields: [
      { key: 'bv_straight_80x220', label: 'Straightflag 80x220cm' },
      { key: 'bv_straight_80x315', label: 'Straightflag 80x315cm' },
      { key: 'bv_straight_90x430', label: 'Straightflag 90x430cm' },
      { key: 'bv_square_75x200',   label: 'Squareflag 75x200cm' },
      { key: 'bv_square_75x300',   label: 'Squareflag 75x300cm' },
      { key: 'bv_square_75x400',   label: 'Squareflag 75x400cm' },
      { key: 'bv_wave_65x150',     label: 'Waveflag 65x150cm' },
      { key: 'bv_wave_65x260',     label: 'Waveflag 65x260cm' },
      { key: 'bv_wave_65x370',     label: 'Waveflag 65x370cm' },
      { key: 'bv_drop_85x220',     label: 'Dropflag 85x220cm' },
      { key: 'bv_drop_85x330',     label: 'Dropflag 85x330cm' },
      { key: 'bv_drop_85x440',     label: 'Dropflag 85x440cm' },
    ]
  },
  {
    title: 'Beachvlag — mast per afmeting',
    fields: [
      { key: 'bv_mast_straight_80x220', label: 'Mast Straightflag 80x220cm' },
      { key: 'bv_mast_straight_80x315', label: 'Mast Straightflag 80x315cm' },
      { key: 'bv_mast_straight_90x430', label: 'Mast Straightflag 90x430cm' },
      { key: 'bv_mast_square_75x200',   label: 'Mast Squareflag 75x200cm' },
      { key: 'bv_mast_square_75x300',   label: 'Mast Squareflag 75x300cm' },
      { key: 'bv_mast_square_75x400',   label: 'Mast Squareflag 75x400cm' },
      { key: 'bv_mast_wave_65x150',     label: 'Mast Waveflag 65x150cm' },
      { key: 'bv_mast_wave_65x260',     label: 'Mast Waveflag 65x260cm' },
      { key: 'bv_mast_wave_65x370',     label: 'Mast Waveflag 65x370cm' },
      { key: 'bv_mast_drop_85x220',     label: 'Mast Dropflag 85x220cm' },
      { key: 'bv_mast_drop_85x330',     label: 'Mast Dropflag 85x330cm' },
      { key: 'bv_mast_drop_85x440',     label: 'Mast Dropflag 85x440cm' },
    ]
  },
  {
    title: 'Stickers / Folie per m²',
    fields: [
      { key: 'st_polymeer_5',    label: 'Polymeerfolie 5 werkdagen' },
      { key: 'st_polymeer_4',    label: 'Polymeerfolie 4 werkdagen' },
      { key: 'st_polymeer_3',    label: 'Polymeerfolie 3 werkdagen' },
      { key: 'st_belettering_5', label: 'Beletteringsfolie 5 werkdagen' },
      { key: 'st_belettering_4', label: 'Beletteringsfolie 4 werkdagen' },
      { key: 'st_belettering_3', label: 'Beletteringsfolie 3 werkdagen' },
    ]
  },
  {
    title: 'Etchfolie / Raamfolie per m²',
    fields: [
      { key: 'ef_5', label: 'Etchfolie 5 werkdagen' },
      { key: 'ef_4', label: 'Etchfolie 4 werkdagen' },
      { key: 'ef_3', label: 'Etchfolie 3 werkdagen' },
    ]
  },
];

// Editor-weergave, overgenomen uit v4 regels 941-961.
export function renderPriceEditor() {
  const el = document.getElementById('price-editor');
  el.innerHTML = PRICE_SCHEMA.map(section => `
    <div class="price-section">
      <h3>${section.title}</h3>
      <div class="price-grid">
        ${section.fields.map(f => `
          <div class="price-field">
            <label>${f.label}</label>
            <div class="euro-wrap">
              <input type="number" step="0.01" min="0"
                value="${(getPrices()[f.key] || 0).toFixed(2)}"
                data-key="${f.key}"
                onchange="updatePrice(this)">
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// v4 regels 963-970.
export function updatePrice(input) {
  const key = input.dataset.key;
  const val = parseFloat(input.value);
  if (!isNaN(val) && val >= 0) {
    setPrice(key, val);
    savePrices();
  }
}

// v4 regels 924-930.
export function resetPrices() {
  if (!confirm('Wil je alle prijzen terugzetten naar de oorspronkelijke waarden?')) return;
  resetToDefaults();
  renderPriceEditor();
  showSaved();
}
