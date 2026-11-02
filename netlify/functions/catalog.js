// Cijene su ovdje NA SERVERU (u centima) – kupac ih ne može promijeniti.
// Ako mijenjaš cijene, promijeni ih i u script.js (da se isto prikazuju).
const KNIFE = 1999, KNIFE_2 = 2499, STAND = 799;

const CATALOG = {
  black:  { name: 'Crni karambit',            prices: [KNIFE, KNIFE_2], labels: ['Opcija 1', 'Opcija 2'] },
  blue:   { name: 'Plavi karambit',           prices: [KNIFE, KNIFE_2], labels: ['Opcija 1', 'Opcija 2'] },
  purple: { name: 'Ljubičasti karambit',      prices: [KNIFE, KNIFE_2], labels: ['Opcija 1', 'Opcija 2'] },
  red:    { name: 'Crveni karambit',          prices: [KNIFE, KNIFE_2], labels: ['Opcija 1', 'Opcija 2'] },
  yellow: { name: 'Žuti (zlatni) karambit',   prices: [KNIFE, KNIFE_2], labels: ['Opcija 1', 'Opcija 2'] },
  stand:  { name: 'Stalak za nož',            prices: [STAND],          labels: ['Standard'] },
};
module.exports = { CATALOG };
