import { observeReveals } from './effects.js';
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
const cakeDropdown = document.getElementById('cakeDropdown');
const desktop = matchMedia('(min-width: 64rem)');
function closeMenu(restoreFocus = false) {
  if (restoreFocus) toggle.focus();
  nav.classList.remove('is-open');
  if (cakeDropdown) cakeDropdown.open = false;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.querySelector('span').textContent = 'Menu';
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('span').textContent = open ? 'Close' : 'Menu';
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (cakeDropdown?.open) {
      cakeDropdown.open = false;
      cakeDropdown.querySelector('summary').focus();
    } else if (nav.classList.contains('is-open') && !desktop.matches) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!desktop.matches && !event.target.closest('.site-header')) closeMenu();
    if (cakeDropdown && !event.target.closest('.nav-dropdown')) cakeDropdown.open = false;
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  desktop.addEventListener('change', () => closeMenu(!desktop.matches && nav.contains(document.activeElement)));
  // The static navigation remains usable when JavaScript is disabled.
  document.documentElement.classList.add('js');
}
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
observeReveals();
