import { products, getProduct, imagePath } from './products.js';
import { setupValidation, validateForm, clearFieldError } from './forms.js';
import { buildQuoteMessage, openWhatsApp } from './whatsapp.js';
const form = document.getElementById('cakeForm');
const design = document.getElementById('cakeDesign');
const customGroup = document.getElementById('customDesignGroup');
const custom = document.getElementById('customDesign');
const date = document.getElementById('deliveryDate');
const addressGroup = document.getElementById('addressGroup');
const address = document.getElementById('deliveryAddress');
const reference = document.getElementById('referenceImage');
const preview = document.getElementById('imagePreview');
const previewGroup = document.getElementById('referencePreview');
const filename = document.getElementById('fileName');
const feedback = document.getElementById('formFeedback');
let objectURL = null;
design.replaceChildren(new Option('Choose a design', ''), ...products.map(product => new Option(product.title, product.id)), new Option('My own custom design', 'custom'));
const requested = new URLSearchParams(location.search).get('cake');
if (getProduct(requested)) design.value = requested;
else if (requested === 'custom') design.value = 'custom';
else if (requested) document.getElementById('designNotice').hidden = false;
function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function readDetails() {
  const data = new FormData(form);
  return {
    design: getProduct(design.value)?.title || (design.value === 'custom' ? custom.value.trim() || 'My own custom design' : ''),
    weight: data.get('weight') || '',flavor: data.get('flavor') || '',occasion: data.get('occasion') || '',
    message: data.get('cakeMessage').trim(),date: data.get('deliveryDate') || '',delivery: data.get('delivery') || '',
    address: data.get('delivery') === 'Home delivery' ? address.value.trim() : '',
    notes: data.get('notes').trim(),reference: Boolean(reference.files.length && objectURL)
  };
}
function updateSummary() {
  date.min = localDate();
  const ownDesign = design.value === 'custom';
  customGroup.hidden = !ownDesign; custom.disabled = !ownDesign; custom.required = ownDesign;
  const delivery = form.querySelector('input[name="delivery"]:checked')?.value;
  addressGroup.hidden = delivery !== 'Home delivery'; address.disabled = addressGroup.hidden; address.required = !addressGroup.hidden;
  const details = readDetails();
  const product = getProduct(design.value);
  const selectedImage = document.getElementById('selectedCakeImage');
  selectedImage.hidden = !product;
  if (product) { selectedImage.src = imagePath(product, 400); selectedImage.alt = product.alt; }
  else selectedImage.removeAttribute('src');
  document.getElementById('selectedCakeTitle').textContent = details.design || 'Your cake, your way';
  document.getElementById('selectedDesign').classList.toggle('has-image', Boolean(product));
  for (const key of ['weight','flavor','occasion','message','date','delivery','address','notes']) {
    document.getElementById(`summary-${key}`).textContent = details[key] || (['message','notes'].includes(key) ? 'None added' : 'Not selected');
  }
  document.getElementById('summary-address-row').hidden = delivery !== 'Home delivery';
  document.getElementById('summary-reference').textContent = details.reference ? 'Preview selected; attach manually in WhatsApp' : 'Attach directly in WhatsApp, if needed';
}
function revokePreview() { if (objectURL) URL.revokeObjectURL(objectURL); objectURL = null; }
function clearPreview() {
  revokePreview(); reference.value = ''; reference.setCustomValidity(''); clearFieldError(reference);
  preview.removeAttribute('src'); previewGroup.hidden = true; filename.textContent = '';
  document.getElementById('referenceError').textContent = ''; updateSummary();
}
reference.addEventListener('change', () => {
  revokePreview(); preview.removeAttribute('src'); previewGroup.hidden = true;
  const file = reference.files[0]; const error = document.getElementById('referenceError');
  reference.setCustomValidity(''); error.textContent = '';
  if (!file) { updateSummary(); return; }
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    reference.value = ''; error.textContent = 'Choose a JPG, PNG or WebP image of 8 MB or less.'; updateSummary(); return;
  }
  objectURL = URL.createObjectURL(file); preview.src = objectURL; filename.textContent = file.name;
  previewGroup.hidden = false; updateSummary();
});
preview.addEventListener('error', () => {
  clearPreview();
  document.getElementById('referenceError').textContent = 'This image could not be previewed. Choose another image or attach it directly in WhatsApp.';
});
document.getElementById('removeImage').addEventListener('click', clearPreview);
window.addEventListener('pagehide', () => { revokePreview(); previewGroup.hidden = true; });
window.addEventListener('pageshow', event => { if (event.persisted) { clearPreview(); updateSummary(); } });
setupValidation(form);
form.addEventListener('input', updateSummary);
form.addEventListener('change', () => {
  updateSummary();
  const url = new URL(location.href);
  if (design.value) url.searchParams.set('cake', design.value); else url.searchParams.delete('cake');
  history.replaceState(null, '', url);
});
form.addEventListener('submit', event => {
  event.preventDefault(); updateSummary();
  custom.setCustomValidity(custom.required && !custom.value.trim() ? 'Describe the cake design you have in mind.' : '');
  address.setCustomValidity(address.required && !address.value.trim() ? 'Enter the home delivery address.' : '');
  if (!validateForm(form, feedback)) return;
  openWhatsApp(buildQuoteMessage(readDetails()));
});
updateSummary();
form.querySelector('[type="submit"]').disabled = false;
