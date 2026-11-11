import { products, getProduct, imagePath } from './products.js';
import { menuCategories, getMenuItem, getMenuCategory, itemsInCategory,
  formatMoney, pricingUnit, estimateBaseAmount } from './menu-data.js';
import { setupValidation, validateForm, clearFieldError } from './forms.js';
import { buildQuoteMessage, openWhatsApp } from './whatsapp.js';

const form = document.getElementById('cakeForm');
const itemSelect = document.getElementById('menuItem');
const quantity = document.getElementById('quantity');
const design = document.getElementById('cakeDesign');
const custom = document.getElementById('customDesign');
const date = document.getElementById('deliveryDate');
const address = document.getElementById('deliveryAddress');
const reference = document.getElementById('referenceImage');
const preview = document.getElementById('imagePreview');
const previewGroup = document.getElementById('referencePreview');
const feedback = document.getElementById('formFeedback');
const categoryState = new Map(menuCategories.map(category => [category.id, { itemId: '', quantity: '1' }]));
let currentCategory = 'cakes';
let objectURL = null;

design.replaceChildren(new Option('Discuss the design with the baker', ''),
  ...products.map(product => new Option(product.title, product.id)), new Option('Describe my own design', 'custom'));
const parameters = new URLSearchParams(location.search);
const requestedItem = getMenuItem(parameters.get('item'));
const requestedCategory = getMenuCategory(parameters.get('category'));
const requestedDesign = parameters.get('cake');
if (getProduct(requestedDesign) || requestedDesign === 'custom') design.value = requestedDesign;
else if (requestedDesign) document.getElementById('designNotice').hidden = false;
if (parameters.has('item') && !requestedItem) document.getElementById('itemNotice').hidden = false;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element.textContent !== value) element.textContent = value;
}
function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function toggleGroup(id, active) {
  const group = document.getElementById(id);
  group.hidden = !active;
  if (group.tagName === 'FIELDSET') group.disabled = !active;
}
function applyCategory(categoryId) {
  currentCategory = categoryId;
  const saved = categoryState.get(categoryId);
  const cake = categoryId === 'cakes';
  const options = itemsInCategory(categoryId).map(item =>
    new Option(`${item.name} — ${formatMoney(item.price)} ${pricingUnit(item)}`, item.id));
  itemSelect.replaceChildren(new Option(cake ? 'Choose a cake variety' : 'Choose an item', ''), ...options);
  itemSelect.value = saved.itemId;
  quantity.value = saved.quantity;
  form.querySelectorAll('input[name="category"]').forEach(radio => { radio.checked = radio.value === categoryId; });
  toggleGroup('cakeWeightGroup', cake);
  toggleGroup('cakeCustomization', cake);
  toggleGroup('referenceSection', cake);
  toggleGroup('quantityGroup', !cake);
  quantity.disabled = cake;
  quantity.required = !cake;
  setText('menuItemLabel', cake ? 'Cake variety (required)' : 'Menu item (required)');
  setText('itemHelp', cake ? 'Choose the cake variety here. Decoration is selected separately below.'
    : 'The listed price is for one item. Choose your quantity below.');
  form.querySelectorAll('input, select, textarea').forEach(clearFieldError);
  feedback.textContent = '';
  updateSummary();
}
function readDetails() {
  const data = new FormData(form);
  const cake = currentCategory === 'cakes';
  const weight = Number(data.get('weight'));
  return {
    itemId: itemSelect.value,
    weight: cake && weight ? weight : null,
    quantity: cake ? null : Number(quantity.value),
    design: cake ? getProduct(design.value)?.title || (design.value === 'custom' ? 'My own custom design' : '') : '',
    designRequests: cake && design.value === 'custom' ? custom.value.trim() : '',
    occasion: cake ? String(data.get('occasion') || '') : '',
    message: cake ? String(data.get('cakeMessage') || '').trim() : '',
    date: date.value,
    delivery: data.get('delivery') || '',
    address: data.get('delivery') === 'Home delivery' ? address.value.trim() : '',
    notes: String(data.get('notes') || '').trim(),
    reference: cake && Boolean(reference.files.length && objectURL)
  };
}
function updateSummary() {
  date.min = localDate();
  const cake = currentCategory === 'cakes';
  const ownDesign = cake && design.value === 'custom';
  toggleGroup('customDesignGroup', ownDesign);
  custom.disabled = !ownDesign;
  custom.required = ownDesign;
  const delivery = form.querySelector('input[name="delivery"]:checked')?.value;
  toggleGroup('addressGroup', delivery === 'Home delivery');
  address.disabled = delivery !== 'Home delivery';
  address.required = !address.disabled;
  const details = readDetails();
  const item = getMenuItem(details.itemId);
  const amount = cake ? details.weight : details.quantity;
  const estimate = estimateBaseAmount(details.itemId, amount);
  const product = cake ? getProduct(design.value) : null;
  const selectedImage = document.getElementById('selectedCakeImage');
  selectedImage.hidden = !product;
  if (product) {
    const src = imagePath(product, 400);
    if (selectedImage.getAttribute('src') !== src) selectedImage.src = src;
    selectedImage.alt = product.alt;
  } else selectedImage.removeAttribute('src');
  document.getElementById('selectedDesign').classList.toggle('has-image', Boolean(product));
  setText('selectedCakeTitle', item?.name || 'Choose a menu item');
  setText('selectedCakeDesign', cake ? `Design: ${details.design || 'to discuss with the baker'}` : 'Quoted by quantity, with availability confirmed on WhatsApp');
  setText('summary-category', getMenuCategory(currentCategory).name);
  setText('summary-unitPrice', item ? `${formatMoney(item.price)} ${pricingUnit(item)}` : 'Choose an item');
  setText('itemUnitPrice', item ? `${formatMoney(item.price)} ${pricingUnit(item)}` : 'Choose an item to see its base price.');
  setText('summary-weight', details.weight ? `${details.weight} ${details.weight === 1 ? 'pound' : 'pounds'}` : 'Not selected');
  setText('summary-quantity', Number.isSafeInteger(details.quantity) && details.quantity > 0 ? String(details.quantity) : 'Enter a whole quantity');
  for (const key of ['occasion', 'message', 'date', 'delivery', 'address', 'notes', 'designRequests']) {
    setText(`summary-${key}`, details[key] || (['message', 'notes', 'designRequests'].includes(key) ? 'None added' : 'Not selected'));
  }
  for (const key of ['weight', 'occasion', 'message', 'designRequests', 'reference']) {
    document.getElementById(`summary-${key}-row`).hidden = !cake;
  }
  document.getElementById('summary-message-row').hidden = !cake || !details.message;
  document.getElementById('summary-designRequests-row').hidden = !cake || !details.designRequests;
  document.getElementById('summary-reference-row').hidden = !cake || !details.reference;
  document.getElementById('summary-quantity-row').hidden = cake;
  document.getElementById('summary-address-row').hidden = delivery !== 'Home delivery';
  setText('summary-reference', details.reference ? 'Preview selected; attach manually in WhatsApp' : 'Attach in WhatsApp, if needed');
  setText('estimatedBaseAmount', estimate === null ? 'Choose an item and amount' : formatMoney(estimate));
  setText('estimateCalculation', estimate === null ? 'The base estimate will appear here.'
    : `${amount} ${cake ? amount === 1 ? 'pound' : 'pounds' : amount === 1 ? 'item' : 'items'} × ${formatMoney(item.price)} ${pricingUnit(item)}`);
  if (design.value) document.getElementById('designNotice').hidden = true;
  if (item) document.getElementById('itemNotice').hidden = true;
}
function updatePublicURL() {
  const url = new URL(location.href);
  url.searchParams.set('category', currentCategory);
  if (itemSelect.value) url.searchParams.set('item', itemSelect.value);
  else url.searchParams.delete('item');
  if (currentCategory === 'cakes' && design.value) url.searchParams.set('cake', design.value);
  else url.searchParams.delete('cake');
  history.replaceState(null, '', url);
}

function revokePreview() { if (objectURL) URL.revokeObjectURL(objectURL); objectURL = null; }
function clearPreview() {
  revokePreview(); reference.value = ''; clearFieldError(reference);
  preview.removeAttribute('src'); previewGroup.hidden = true;
  setText('fileName', ''); setText('referenceError', ''); updateSummary();
}
reference.addEventListener('change', () => {
  revokePreview(); preview.removeAttribute('src'); previewGroup.hidden = true;
  const file = reference.files[0];
  setText('referenceError', '');
  if (!file) { updateSummary(); return; }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    reference.value = ''; setText('referenceError', 'Choose a JPG, PNG or WebP image of 8 MB or less.');
    updateSummary(); return;
  }
  objectURL = URL.createObjectURL(file);
  preview.src = objectURL; setText('fileName', file.name); previewGroup.hidden = false; updateSummary();
});
preview.addEventListener('error', () => {
  clearPreview(); setText('referenceError', 'This image could not be previewed. Choose another image or attach it directly in WhatsApp.');
});
document.getElementById('removeImage').addEventListener('click', clearPreview);
window.addEventListener('pagehide', () => { revokePreview(); previewGroup.hidden = true; });
window.addEventListener('pageshow', event => { if (event.persisted) clearPreview(); });

setupValidation(form);
form.addEventListener('input', event => { if (event.target.name !== 'category') updateSummary(); });
form.addEventListener('change', event => {
  if (event.target.name === 'category') {
    categoryState.set(currentCategory, { itemId: itemSelect.value, quantity: quantity.value });
    applyCategory(event.target.value);
  } else updateSummary();
  if (['category', 'item', 'cakeDesign'].includes(event.target.name)) updatePublicURL();
});
form.addEventListener('submit', event => {
  event.preventDefault(); updateSummary();
  custom.setCustomValidity(custom.required && !custom.value.trim() ? 'Describe the cake design you have in mind.' : '');
  address.setCustomValidity(address.required && !address.value.trim() ? 'Enter the home delivery address.' : '');
  quantity.setCustomValidity(currentCategory !== 'cakes' && getMenuItem(itemSelect.value)
    && estimateBaseAmount(itemSelect.value, Number(quantity.value)) === null ? 'Enter a positive whole quantity that can be calculated safely.' : '');
  if (!validateForm(form, feedback)) return;
  openWhatsApp(buildQuoteMessage(readDetails()));
});

const initialCategory = requestedItem?.category || requestedCategory?.id || 'cakes';
if (requestedItem) categoryState.get(initialCategory).itemId = requestedItem.id;
applyCategory(initialCategory);
form.querySelector('[type="submit"]').disabled = false;
