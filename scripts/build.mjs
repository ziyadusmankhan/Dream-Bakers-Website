// Dependency-free shared component synchronization. Pages are directly deployable.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products } from '../js/products.js';
const root = new URL('../', import.meta.url);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function card(product) {
  const {id,image,title,category,description,alt} = product;
  return `<article class="cake-card"><a class="cake-image" href="/order.html?cake=${escape(id)}" aria-label="Customize ${escape(title)}"><img src="/assets/cakes/optimized/${image}-640.webp" srcset="/assets/cakes/optimized/${image}-400.webp 400w, /assets/cakes/optimized/${image}-640.webp 640w, /assets/cakes/optimized/${image}-1000.webp 1000w" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" alt="${escape(alt)}" width="640" height="800" loading="lazy" decoding="async"></a><div class="cake-copy"><p class="cake-category">${escape(category)}</p><h3>${escape(title)}</h3><p>${escape(description)}</p><a class="text-link" href="/order.html?cake=${escape(id)}" aria-label="Customize This Cake: ${escape(title)}">Customize This Cake</a></div></article>`;
}
for (const page of ['index','catalog','order','about','contact','404']) {
  const path = new URL(`${page}.html`, root);
  let html = await readFile(path, 'utf8');
  const collections = {featured:['6','1','5'].map(id => products.find(product => product.id === id)),catalog:products};
  for (const [name, collection] of Object.entries(collections)) {
    html = html.replace(new RegExp(`<!-- cakes:${name} -->[\\s\\S]*?<!-- /cakes:${name} -->`), `<!-- cakes:${name} -->\n${collection.map(card).join('\n')}\n<!-- /cakes:${name} -->`);
  }
  html = html.replace(/<!-- design-options -->[\s\S]*?<!-- \/design-options -->/, `<!-- design-options -->${products.map(product => `<option value="${escape(product.id)}">${escape(product.title)}</option>`).join('')}<!-- /design-options -->`);
  for (const component of ['header','footer']) {
    let partial = (await readFile(new URL(`components/${component}.html`, root), 'utf8')).trim();
    if (component === 'header') partial = partial.replace(/href="\/(index|catalog|order|about|contact)\.html"/g, (match, name) => name === page ? `${match} aria-current="page"` : match);
    html = html.replace(new RegExp(`<!-- shared:${component} -->[\\s\\S]*?<!-- /shared:${component} -->`), `<!-- shared:${component} -->\n${partial}\n<!-- /shared:${component} -->`);
  }
  await writeFile(path, html);
}
console.log(`Updated shared components in ${fileURLToPath(root)}`);
