export function clearFieldError(field) {
  field.removeAttribute('aria-invalid');
  document.getElementById(`${field.id}-error`)?.remove();
  const descriptions = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== `${field.id}-error`);
  if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
  else field.removeAttribute('aria-describedby');
}
function showFieldError(field) {
  clearFieldError(field);
  const error = document.createElement('p');
  error.id = `${field.id}-error`; error.className = 'field-error'; error.textContent = field.validationMessage;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', `${field.getAttribute('aria-describedby') || ''} ${error.id}`.trim());
  const group = field.closest('.choice-group');
  if (group) group.append(error); else field.insertAdjacentElement('afterend', error);
}
export function validateForm(form, feedback) {
  const fields = [...form.querySelectorAll('input, select, textarea')];
  fields.forEach(clearFieldError);
  const invalid = fields.filter(field => field.willValidate && !field.validity.valid);
  const seenGroups = new Set();
  invalid.forEach(field => {
    if (field.type === 'radio') {
      if (seenGroups.has(field.name)) return;
      seenGroups.add(field.name);
    }
    showFieldError(field);
  });
  feedback.textContent = invalid.length ? 'Please check the highlighted fields before opening WhatsApp.' : '';
  if (invalid[0]) invalid[0].focus();
  return invalid.length === 0;
}
export function setupValidation(form) {
  form.addEventListener('input', event => {
    if (event.target.matches('input,select,textarea')) {
      const field = event.target;
      if (field.type === 'radio') form.querySelectorAll(`input[name="${field.name}"]`).forEach(clearFieldError);
      else clearFieldError(field);
    }
  });
  form.noValidate = true;
}
