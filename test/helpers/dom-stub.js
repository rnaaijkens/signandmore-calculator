// Minimale DOM- en localStorage-stub.
//
// Bewust met de hand geschreven in plaats van jsdom: het rekenpad van de
// calculators raakt maar drie dingen aan — de `value` van een input, de
// `innerHTML` van een resultaatvak, en localStorage. Zo blijft het project
// zonder extra afhankelijkheid, wat past bij de eis dat de calculator offline
// en zonder installatie werkt.

function makeElement(id) {
  return {
    id,
    value: '',
    innerHTML: '',
    dataset: {},
    classList: { add() {}, remove() {} },
  };
}

export function createDom(initialValues = {}) {
  const elements = new Map();

  function getElementById(id) {
    if (!elements.has(id)) {
      const el = makeElement(id);
      if (id in initialValues) el.value = initialValues[id];
      elements.set(id, el);
    }
    return elements.get(id);
  }

  const store = new Map();

  return {
    document: {
      getElementById,
      // showTab wordt in de golden-master niet gedraaid; een lege lijst houdt
      // de stub eerlijk in plaats van stilzwijgend iets te verzinnen.
      querySelectorAll: () => [],
    },
    localStorage: {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: key => store.delete(key),
    },
    // Waarden zetten en resultaten uitlezen.
    set(values) {
      for (const [id, val] of Object.entries(values)) getElementById(id).value = String(val);
    },
    get: id => getElementById(id),
    html: id => getElementById(id).innerHTML,
    clear: id => { getElementById(id).innerHTML = ''; },
  };
}
