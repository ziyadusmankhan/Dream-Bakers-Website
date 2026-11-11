import { getMenuItem, getMenuCategory, formatMoney, estimateBaseAmount } from './menu-data.js';

export const WHATSAPP_NUMBER = '923477268670';
export function whatsappURL(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
// Synchronous same-tab navigation avoids delayed popup blocking.
export function openWhatsApp(message) { window.location.assign(whatsappURL(message)); }

export function buildQuoteMessage(details) {
  const item = getMenuItem(details.itemId);
  const cake = item?.category === 'cakes';
  const amount = cake ? details.weight : details.quantity;
  const estimate = estimateBaseAmount(details.itemId, amount);
  if (!item || estimate === null) throw new RangeError('Choose a valid item and weight or quantity.');
  const lines = ['Hello Dream Bakerz,', '', 'I would like to request an order quotation.', '',
    `Category: ${getMenuCategory(item.category).name}`, `Item: ${item.name}`,
    cake ? `Weight: ${amount} ${amount === 1 ? 'Pound' : 'Pounds'}` : `Quantity: ${amount}`,
    `${cake ? 'Price Per Pound' : 'Unit Price'}: ${formatMoney(item.price)}`,
    `Estimated Base Amount: ${formatMoney(estimate)}`];
  if (cake) {
    if (details.design) lines.push(`Cake Design: ${details.design}`);
    if (details.designRequests) lines.push(`Special Design Requests: ${details.designRequests}`);
    if (details.occasion) lines.push(`Occasion: ${details.occasion}`);
    if (details.message) lines.push(`Cake Message: ${details.message}`);
    if (details.reference) lines.push('Reference Design: I will attach my reference image in this WhatsApp chat.');
  }
  lines.push('', `Required Date: ${details.date}`, `Delivery Method: ${details.delivery}`);
  if (details.delivery === 'Home delivery' && details.address) lines.push(`Delivery Address: ${details.address}`);
  if (details.notes) lines.push('', 'Additional Instructions:', details.notes);
  lines.push('', 'The base estimate excludes any design/customization and delivery charges.',
    'Please confirm the final price and availability.', '', 'Thank you.');
  return lines.join('\n');
}
