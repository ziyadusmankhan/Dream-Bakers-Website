import test from 'node:test';
import assert from 'node:assert/strict';
import { menuItems, menuCategories, cakeWeights, getMenuItem, itemsInCategory,
  estimateBaseAmount, formatMoney } from '../js/menu-data.js';
import { buildQuoteMessage, whatsappURL } from '../js/whatsapp.js';

// Independent transcription of the approved written brief catches accidental
// price changes, particularly the two corrections to the older poster.
const approved = [
  ['Red Velvet', 1500], ['Vanilla', 1500], ['Vanilla Caramel', 1500], ['Chocolate', 1500],
  ['Chocolate Fudge', 1700], ['Chocolate Alaska', 1700], ['Vanilla Alaska', 1700],
  ['Snickers Cake', 1700], ['Full Fondant Cake', 2000], ['3 Milk Cake', 1500],
  ['Simple Cupcake', 200], ['Design Cupcake', 250], ['Fondant Work Cupcake', 300],
  ['Chocolate Fudge Brownie 2×2', 180], ['Chocolate Fudge Brownie 3×3', 200],
  ['Vanilla Teacake Small', 500], ['Vanilla Teacake Large', 700],
  ['Chocolate Teacake Small', 500], ['Chocolate Teacake Large', 700],
  ['Banana Bread Small', 500], ['Banana Bread Large', 700],
  ['Donut', 200], ['Chocolate Filled Donut', 250]
];
test('all 23 official names and prices match the corrected brief', () => {
  assert.deepEqual(menuItems.map(item => [item.name, item.price]), approved);
  assert.equal(new Set(menuItems.map(item => item.id)).size, 23);
  assert.deepEqual(menuCategories.map(category => itemsInCategory(category.id).length), [10, 3, 2, 6, 2]);
  assert(menuItems.every(item => item.currency === 'PKR' && item.image === null));
  assert.deepEqual(itemsInCategory('brownies').map(item => item.variation), ['2×2', '3×3']);
});
test('each base estimate uses the correct numerical unit and price', () => {
  for (const item of menuItems) {
    assert.equal(item.unit, item.category === 'cakes' ? 'pound' : 'piece');
    for (const amount of item.category === 'cakes' ? cakeWeights : [1, 2, 6, 12]) {
      assert.equal(estimateBaseAmount(item.id, amount), item.price * amount);
    }
  }
  assert.equal(estimateBaseAmount('cake-chocolate-fudge', 2), 3400);
  assert.equal(estimateBaseAmount('donut-chocolate-filled', 6), 1500);
  assert.equal(estimateBaseAmount('cake-three-milk', 3), 4500);
  assert.equal(formatMoney(3400), 'Rs. 3,400');
});
test('invalid amounts and non-menu weights cannot produce a misleading estimate', () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER, '2', null]) {
    assert.equal(estimateBaseAmount('donut-plain', amount), null);
  }
  assert.equal(estimateBaseAmount('cake-chocolate-fudge', 4), null);
  assert.equal(estimateBaseAmount('unknown', 2), null);
});
const common = {date:'2026-12-01',delivery:'Home delivery',address:'B-17, Islamabad',notes:'Please discuss availability.'};
test('cake quotation includes variety, decoration, real base price, weight and address', () => {
  const message = buildQuoteMessage({...common,itemId:'cake-chocolate-fudge',weight:2,
    design:'Blue daisy cake',occasion:'Birthday',message:'Happy Birthday & best wishes',reference:true});
  for (const expected of ['Category: Cakes','Item: Chocolate Fudge','Weight: 2 Pounds',
    'Price Per Pound: Rs. 1,700','Estimated Base Amount: Rs. 3,400','Cake Design: Blue daisy cake',
    'Delivery Address: B-17, Islamabad','attach my reference image','Please confirm the final price and availability.']) {
    assert(message.includes(expected), expected);
  }
  const url = new URL(whatsappURL(message));
  assert.equal(url.pathname, '/923477268670');
  assert.equal(url.searchParams.get('text'), message);
  assert(!message.includes('Final Total'));
});
test('every non-cake category uses quantity and excludes all cake-only fields', () => {
  for (const category of menuCategories.filter(category => category.id !== 'cakes')) {
    const item = itemsInCategory(category.id)[0];
    const message = buildQuoteMessage({...common,itemId:item.id,quantity:6,
      delivery:'Pickup',design:'Hidden cake design',occasion:'Birthday',message:'Hidden message',reference:true});
    assert(message.includes(`Category: ${category.name}`));
    assert(message.includes(`Item: ${item.name}`));
    assert(message.includes('Quantity: 6'));
    assert(message.includes(`Unit Price: ${formatMoney(item.price)}`));
    for (const irrelevant of ['Weight:', 'Pound', 'Cake Design:', 'Cake Message:', 'Occasion:', 'Reference Design:', 'Delivery Address:']) {
      assert(!message.includes(irrelevant), `${category.name}: ${irrelevant}`);
    }
  }
});
test('custom design requests and invalid input are handled explicitly', () => {
  assert(buildQuoteMessage({...common,itemId:'cake-vanilla',weight:1,design:'My own custom design',designRequests:'Green graduation theme'}).includes('Special Design Requests: Green graduation theme'));
  assert.throws(() => buildQuoteMessage({...common,itemId:'unknown',quantity:1}), RangeError);
  assert.throws(() => buildQuoteMessage({...common,itemId:'donut-plain',quantity:0}), RangeError);
  assert.equal(getMenuItem('unknown'), undefined);
});
