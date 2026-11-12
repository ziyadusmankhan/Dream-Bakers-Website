import { menuCategories, itemsInCategory, formatMoney, pricingUnit } from './menu-data.js';

const root = document.getElementById('kitchenMenu');
if (root) {
  const tablist = document.createElement('div');
  tablist.className = 'menu-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Bakery menu categories');
  const panels = [];
  const tabs = [];

  function activate(index, focus = false) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  menuCategories.forEach((category, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `menu-tab-${category.id}`;
    tab.className = 'menu-tab';
    tab.textContent = category.name;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `menu-panel-${category.id}`);
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (index + 1) % menuCategories.length,
        ArrowLeft: (index + menuCategories.length - 1) % menuCategories.length,
        Home: 0, End: menuCategories.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activate(keys[event.key], true);
    });
    const panel = document.createElement('section');
    panel.id = `menu-panel-${category.id}`;
    panel.className = 'menu-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    const heading = document.createElement('div');
    heading.className = 'menu-panel-heading';
    const title = document.createElement('h3');
    title.textContent = category.name;
    const unit = document.createElement('p');
    unit.textContent = category.unit === 'pound' ? 'Prices per pound' : 'Prices per item';
    heading.append(title, unit);
    const rows = document.createElement('div');
    rows.className = 'menu-price-rows';
    itemsInCategory(category.id).forEach(entry => {
      const link = document.createElement('a');
      link.className = 'menu-price-row';
      link.href = `/order.html?item=${encodeURIComponent(entry.id)}`;
      const name = document.createElement('span');
      name.textContent = entry.name;
      const price = document.createElement('span');
      price.className = 'menu-price';
      price.textContent = formatMoney(entry.price);
      const hint = document.createElement('span');
      hint.className = 'sr-only';
      hint.textContent = ` ${pricingUnit(entry)}. Customize this item.`;
      link.append(name, price, hint);
      rows.append(link);
    });
    panel.append(heading, rows);
    tabs.push(tab);
    panels.push(panel);
    tablist.append(tab);
  });
  // The shared build supplies native one-at-a-time disclosures without JS.
  // Re-render from the data so changing a price updates the live component too.
  root.replaceChildren(tablist, ...panels);
  activate(0);
}
