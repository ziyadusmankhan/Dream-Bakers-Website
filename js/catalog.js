import { products } from './products.js';
import { renderProducts } from './render.js';
const grid = document.getElementById('productsGrid');
const search = document.getElementById('searchInput');
const sort = document.getElementById('sortSelect');
const count = document.getElementById('productCount');
const empty = document.getElementById('emptyState');
const filters = document.getElementById('categoryFilters');
let category = 'All cakes';
filters.replaceChildren();
['All cakes', ...new Set(products.map(product => product.category))].forEach(name => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'filter-button'; button.textContent = name;
  button.setAttribute('aria-pressed', String(name === category));
  button.addEventListener('click', () => {
    category = name;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    updateCatalog();
  });
  filters.append(button);
});
function updateCatalog() {
  const query = search.value.trim().toLocaleLowerCase();
  const results = products.filter(product =>
    (category === 'All cakes' || product.category === category) &&
    `${product.title} ${product.category} ${product.description}`.toLocaleLowerCase().includes(query)
  );
  if (sort.value === 'name') results.sort((a, b) => a.title.localeCompare(b.title));
  renderProducts(grid, results);
  count.textContent = `${results.length} ${results.length === 1 ? 'design' : 'designs'}${query ? ` matching “${search.value.trim()}”` : ' to make your own'}`;
  empty.hidden = results.length > 0; grid.hidden = results.length === 0;
}
document.getElementById('resetFilters').addEventListener('click', () => {
  search.value = ''; sort.value = 'curated'; filters.querySelector('button').click(); search.focus();
});
search.addEventListener('input', updateCatalog);
sort.addEventListener('change', updateCatalog);
updateCatalog();
