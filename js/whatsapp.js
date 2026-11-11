export const WHATSAPP_NUMBER = '923477268670';
export function whatsappURL(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
// Synchronous same-tab navigation avoids delayed popup blocking.
export function openWhatsApp(message) { window.location.assign(whatsappURL(message)); }
export function buildQuoteMessage(details) {
  const lines = ['Hello Dream Bakerz,', '', 'I would like to request a quotation for a customized cake.', '',
    `Cake Design: ${details.design}`, `Weight: ${details.weight}`, `Flavor: ${details.flavor}`, `Occasion: ${details.occasion}`];
  if (details.message) lines.push(`Cake Message: ${details.message}`);
  lines.push(`Required Date: ${details.date}`, `Delivery Method: ${details.delivery}`);
  if (details.delivery === 'Home delivery' && details.address) lines.push(`Delivery Address: ${details.address}`);
  if (details.notes) lines.push(`Additional Instructions: ${details.notes}`);
  if (details.reference) lines.push('Reference Design: I will attach my reference image in this WhatsApp chat.');
  lines.push('', 'I would appreciate a quotation and confirmation of availability.', '', 'Thank you.');
  return lines.join('\n');
}
