// Approved 12 November 2026 menu. The supplied written corrections take
// precedence over the older poster for Chocolate Fudge and 3 Milk Cake.
// Visual gallery designs are separate: none implies a particular variety.
export const menuCategories = [
  { id: 'cakes', name: 'Cakes', unit: 'pound' },
  { id: 'cupcakes', name: 'Cupcakes', unit: 'piece' },
  { id: 'brownies', name: 'Brownies', unit: 'piece' },
  { id: 'tea-cakes', name: 'Tea Cakes', unit: 'piece' },
  { id: 'donuts', name: 'Donuts', unit: 'piece' }
];

export const cakeWeights = [1, 2, 3, 5];

function item(id, name, category, price, variation = null, customizable = false) {
  return { id, name, category, price, currency: 'PKR',
    unit: category === 'cakes' ? 'pound' : 'piece', variation, customizable, image: null };
}

export const menuItems = [
  item('cake-red-velvet', 'Red Velvet', 'cakes', 1500, null, true),
  item('cake-vanilla', 'Vanilla', 'cakes', 1500, null, true),
  item('cake-vanilla-caramel', 'Vanilla Caramel', 'cakes', 1500, null, true),
  item('cake-chocolate', 'Chocolate', 'cakes', 1500, null, true),
  item('cake-chocolate-fudge', 'Chocolate Fudge', 'cakes', 1700, null, true),
  item('cake-chocolate-alaska', 'Chocolate Alaska', 'cakes', 1700, null, true),
  item('cake-vanilla-alaska', 'Vanilla Alaska', 'cakes', 1700, null, true),
  item('cake-snickers', 'Snickers Cake', 'cakes', 1700, null, true),
  item('cake-full-fondant', 'Full Fondant Cake', 'cakes', 2000, null, true),
  item('cake-three-milk', '3 Milk Cake', 'cakes', 1500, null, true),
  item('cupcake-simple', 'Simple Cupcake', 'cupcakes', 200),
  item('cupcake-design', 'Design Cupcake', 'cupcakes', 250, null, true),
  item('cupcake-fondant', 'Fondant Work Cupcake', 'cupcakes', 300, null, true),
  item('brownie-fudge-2x2', 'Chocolate Fudge Brownie 2×2', 'brownies', 180, '2×2'),
  item('brownie-fudge-3x3', 'Chocolate Fudge Brownie 3×3', 'brownies', 200, '3×3'),
  item('tea-vanilla-small', 'Vanilla Teacake Small', 'tea-cakes', 500, 'Small'),
  item('tea-vanilla-large', 'Vanilla Teacake Large', 'tea-cakes', 700, 'Large'),
  item('tea-chocolate-small', 'Chocolate Teacake Small', 'tea-cakes', 500, 'Small'),
  item('tea-chocolate-large', 'Chocolate Teacake Large', 'tea-cakes', 700, 'Large'),
  item('tea-banana-small', 'Banana Bread Small', 'tea-cakes', 500, 'Small'),
  item('tea-banana-large', 'Banana Bread Large', 'tea-cakes', 700, 'Large'),
  item('donut-plain', 'Donut', 'donuts', 200),
  item('donut-chocolate-filled', 'Chocolate Filled Donut', 'donuts', 250)
];

export function getMenuItem(id) { return menuItems.find(entry => entry.id === id); }
export function getMenuCategory(id) { return menuCategories.find(category => category.id === id); }
export function itemsInCategory(category) { return menuItems.filter(entry => entry.category === category); }
export function formatMoney(amount) { return `Rs. ${new Intl.NumberFormat('en-PK').format(amount)}`; }
export function pricingUnit(entry) { return entry.unit === 'pound' ? 'per pound' : 'per item'; }

// No delivery fee or decoration charge is invented. A base estimate is never
// a confirmed quotation. Reject fractions, invalid weights and unsafe totals.
export function estimateBaseAmount(itemId, amount) {
  const entry = getMenuItem(itemId);
  if (!entry || typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount < 1) return null;
  if (entry.category === 'cakes' && !cakeWeights.includes(amount)) return null;
  const estimate = entry.price * amount;
  return Number.isSafeInteger(estimate) ? estimate : null;
}
