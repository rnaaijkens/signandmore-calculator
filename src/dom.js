// DOM-helpers, gelijk aan v4 regels 973-981.
export function showTab(name, btn) {
  document.querySelectorAll('.form-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

export function n(id) { return parseFloat(document.getElementById(id).value) || 0; }
export function v(id) { return document.getElementById(id).value; }

// Leegmaken van een resultaatvak, zoals de vroege uitstap in elke calc* in v4.
export function clearResult(id) { document.getElementById(id).innerHTML = ''; }
